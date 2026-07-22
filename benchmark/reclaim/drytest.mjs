#!/usr/bin/env node
// Local dry run of the Run 11 pool lifecycle — no mesh, no builders, just the v0.4
// machinery against a throwaway broker: enqueue → lease(A) → deliberately no-ack →
// broker redelivery after ack_wait → re-lease(B, attempt=deliveryCount) → commit(B) →
// terminal fact. Exits 0 with PASS only if every step behaves as the spec says
// (deliveryCount advanced, fencingToken bumped, commit won, terminal committed).
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "@nats-io/transport-node";
import { jetstream, jetstreamManager } from "@nats-io/jetstream";
import { Kvm } from "@nats-io/kv";
import {
  workPoolContext, enqueueWorkItem, leaseWorkItem, commitWorkItem, readWorkTerminal,
  createEndpointStreams, epwStreamName, poolConsumerConfig, poolDurable,
} from "@cotal-ai/core";

const fail = (m) => { console.error("FAIL:", m); process.exit(1); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PORT = 20000 + Math.floor(Math.random() * 40000);
const sd = mkdtempSync(join(tmpdir(), "reclaim-dry-"));
const broker = spawn("nats-server", ["-js", "-sd", sd, "-p", String(PORT), "-a", "127.0.0.1"], { stdio: "ignore" });
process.on("exit", () => broker.kill("SIGKILL"));
for (let i = 0; ; i++) {
  try { const c = await connect({ servers: `nats://127.0.0.1:${PORT}` }); await c.close(); break; }
  catch { if (i > 40) fail("broker never came up"); await sleep(250); }
}
console.log(`broker up on :${PORT}`);

const nc = await connect({ servers: `nats://127.0.0.1:${PORT}` });
const js = jetstream(nc), jsm = await jetstreamManager(nc), kv = new Kvm(nc);
const SPACE = "reclaim";
await createEndpointStreams(jsm, kv, SPACE);
const ctx = await workPoolContext(nc, SPACE);
const ACK_WAIT_MS = 1500;
await jsm.consumers.add(epwStreamName(SPACE), poolConsumerConfig(SPACE, "supervisor", "tasks", { ackWaitMs: ACK_WAIT_MS }));
const pool = await js.consumers.get(epwStreamName(SPACE), poolDurable("supervisor", "tasks"));
console.log("pool ready");

const T0 = Date.now();
const workExpiry = T0 + 60_000;
const ref = { endpoint: "supervisor", pool: "tasks", acceptance: { owner: "u_hh", actor: "runner", uid: "hhreclaimhhreclaimhhreclai", id: `dry-${T0}` } };
const workerOf = (name) => ({ kind: "agent", owner: "u_hh", actor: name, lifecycleUid: (name + "x".repeat(26)).slice(0, 26).toLowerCase() });

const enq = await enqueueWorkItem(ctx, ref, new TextEncoder().encode("dry"));
if (!enq.enqueued) fail("enqueue refused");
console.log(`enqueued seq=${enq.seq}`);

async function fetchOne(expiresMs) {
  for await (const m of await pool.fetch({ max_messages: 1, expires: expiresMs })) return m;
  return null;
}

const m1 = await fetchOne(5000);
if (!m1) fail("no first delivery");
if (m1.info.deliveryCount !== 1) fail(`first deliveryCount=${m1.info.deliveryCount}`);
const lease1 = await leaseWorkItem(ctx, { ref, sourceSeq: m1.seq, attempt: m1.info.deliveryCount, worker: workerOf("builderA"), now: Date.now(), leaseTtlMs: 30_000, workExpiry });
if (lease1.state !== "leased" || lease1.fencingToken !== 1) fail(`lease1 ${JSON.stringify(lease1)}`);
console.log(`leased attempt=1 token=1 → builderA (deliberately NOT acking — simulating the kill)`);

const m2 = await fetchOne(ACK_WAIT_MS + 4000);
if (!m2) fail("no redelivery after ack_wait");
if (m2.info.deliveryCount < 2) fail(`redelivery deliveryCount=${m2.info.deliveryCount}`);
console.log(`redelivery arrived deliveryCount=${m2.info.deliveryCount} — builderA is 'dead', re-leasing`);

const lease2 = await leaseWorkItem(ctx, { ref, sourceSeq: m2.seq, attempt: m2.info.deliveryCount, worker: workerOf("builderB"), now: Date.now(), leaseTtlMs: 30_000, workExpiry });
if (lease2.state !== "leased") fail(`lease2 ${JSON.stringify(lease2)}`);
if (!(lease2.fencingToken > lease1.fencingToken)) fail(`fencing did not advance: ${lease2.fencingToken}`);
console.log(`re-leased attempt=${lease2.attempt} token=${lease2.fencingToken} → builderB`);

const commit = await commitWorkItem(ctx, {
  ref, caller: workerOf("builderB"),
  lease: { sourceSeq: lease2.sourceSeq, attempt: lease2.attempt, fencingToken: lease2.fencingToken },
  outcome: { pass: true, dry: true }, now: Date.now(),
});
if (!commit.won || commit.fact?.disposition !== "committed") fail(`commit ${JSON.stringify(commit)}`);
console.log(`committed by builderB: disposition=${commit.fact.disposition} attempt=${commit.fact.attempt} token=${commit.fact.fencingToken}`);

const terminal = await readWorkTerminal(ctx, ref);
if (!terminal || terminal.disposition !== "committed") fail(`terminal ${JSON.stringify(terminal)}`);
m2.ack();
console.log("terminal fact read back ✓");
console.log("PASS — full v0.4 lease/redelivery/re-lease/commit lifecycle verified locally");
await nc.close();
process.exit(0);
