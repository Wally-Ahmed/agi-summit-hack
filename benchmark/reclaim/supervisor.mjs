#!/usr/bin/env node
// Run 11 — the pool-owner supervisor. Plays the endpoint role Cotal v0.4's work pools
// require (the piece a chat-plane mesh has nobody to play): owns the pool's single
// AckExplicit pull consumer, leases the work item to a real builder, DMs that builder the
// task over the chat plane, and never acks until the item is settled. A killed builder
// therefore surfaces as broker redelivery (ack_wait), at which point the owner re-leases
// to the next idle builder with a bumped attempt + fencing token — #258's reassignment
// path, driven for real. Commit publishes the terminal fact; test.py is the only judge.
//
// env: RECLAIM_WORK (required, task workdir with PROMPT.md + test.py)
//      RECLAIM_NATS (default nats://127.0.0.1:4222)   RECLAIM_CREDS (optional .creds path)
//      RECLAIM_SPACE (default "reclaim" — isolated streams; never the live space's)
//      RECLAIM_CAP_S (900)  RECLAIM_ACK_WAIT_MS (15000)  RECLAIM_LEASE_TTL_MS (600000)
//      RECLAIM_SELF_BROKER=1 — spawn a private open-mode nats-server for the pool.
//        For meshes running mode:"auth": the chat plane keeps the mesh's broker; the
//        pool rides its own throwaway one.  RECLAIM_NATS_BIN (default "nats-server")
import { connect } from "@nats-io/transport-node";
import { credsAuthenticator } from "@nats-io/nats-core";
import { jetstream, jetstreamManager } from "@nats-io/jetstream";
import { Kvm } from "@nats-io/kv";
import {
  workPoolContext, enqueueWorkItem, leaseWorkItem, commitWorkItem, readWorkTerminal,
  createEndpointStreams, epwStreamName, poolConsumerConfig, poolDurable,
} from "@cotal-ai/core";
import { execFileSync, spawnSync, spawn } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const WORK = process.env.RECLAIM_WORK;
if (!WORK) { console.error("RECLAIM_WORK is required"); process.exit(2); }
let NATS = process.env.RECLAIM_NATS || "nats://127.0.0.1:4222";
const SPACE = process.env.RECLAIM_SPACE || "reclaim";
const CAP_S = Number(process.env.RECLAIM_CAP_S || 900);
const ACK_WAIT_MS = Number(process.env.RECLAIM_ACK_WAIT_MS || 15000);
const LEASE_TTL_MS = Number(process.env.RECLAIM_LEASE_TTL_MS || 600000);
const ENDPOINT = "supervisor", POOL = "tasks";

const T0 = Date.now();
const log = (m) => console.log(`[+${Math.round((Date.now() - T0) / 1000)}s] ${m}`);
const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, "");

// --- chat-plane helpers (the mesh side stays exactly what it is: cotal CLI) ------------
function roster() {
  // name/role tokens are the first two fields split on space-or-slash; state is textual.
  try {
    const out = stripAnsi(execFileSync("cotal", ["endpoints"], { encoding: "utf8", timeout: 20000 }));
    return out.split("\n").map((line) => {
      const f = line.trim().split(/[ /]+/);
      if (f.length < 2) return null;
      const state = /offline/.test(line) ? "offline" : /working/.test(line) ? "working" : /idle/.test(line) ? "idle" : "unknown";
      return { name: f[0], role: f[1], state, line: line.trim() };
    }).filter(Boolean);
  } catch (e) { log(`roster read failed: ${e.message}`); return []; }
}
const idleBuilders = () => roster().filter((r) => r.role === "builder" && r.state === "idle").map((r) => r.name);
const builderAlive = (name) => {
  const r = roster().find((x) => x.name === name && x.role === "builder");
  return !!r && r.state !== "offline";
};
function dmTask(builder) {
  const msg = `TASK: complete the assignment described in ${WORK}/PROMPT.md, working in the directory ${WORK}. Do the work yourself; do not delegate. DONE-WHEN: cd ${WORK} && python3 test.py prints PASS.`;
  // `send dm <agent>` — `ask` is role-anycast; a bare NAME there blackholes (exit 0, no delivery).
  execFileSync("cotal", ["send", "dm", builder, msg], { encoding: "utf8", timeout: 30000 });
  log(`DM'd task to ${builder}`);
}
const testPasses = () => spawnSync("python3", ["test.py"], { cwd: WORK, timeout: 60000 }).status === 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- private pool broker (mode:"auth" meshes: chat plane keeps its broker, the pool
// gets its own open one — same pattern the dry test proved) -----------------------------
if (process.env.RECLAIM_SELF_BROKER === "1") {
  const port = 24000 + Math.floor(Math.random() * 20000);
  const sd = mkdtempSync(join(tmpdir(), "reclaim-pool-"));
  const bin = process.env.RECLAIM_NATS_BIN || "nats-server";
  const broker = spawn(bin, ["-js", "-sd", sd, "-p", String(port), "-a", "127.0.0.1"], { stdio: "ignore" });
  process.on("exit", () => { try { broker.kill("SIGKILL"); } catch {} });
  NATS = `nats://127.0.0.1:${port}`;
  for (let i = 0; ; i++) {
    try { const c = await connect({ servers: NATS }); await c.close(); break; }
    catch { if (i > 40) { console.error(`self-broker (${bin}) never came up on :${port}`); process.exit(1); } await sleep(250); }
  }
  log(`self-broker up on :${port} (pool decoupled from the mesh broker)`);
}

// --- connect + pool bootstrap (isolated space: EPW_reclaim etc., idempotent) -----------
const opts = { servers: NATS };
if (process.env.RECLAIM_CREDS) {
  opts.authenticator = credsAuthenticator(new TextEncoder().encode(readFileSync(process.env.RECLAIM_CREDS, "utf8")));
}
const nc = await connect(opts);
log(`connected to ${NATS} (space=${SPACE})`);
const js = jetstream(nc), jsm = await jetstreamManager(nc), kv = new Kvm(nc);
await createEndpointStreams(jsm, kv, SPACE);
const ctx = await workPoolContext(nc, SPACE);
try { await jsm.consumers.add(epwStreamName(SPACE), poolConsumerConfig(SPACE, ENDPOINT, POOL, { ackWaitMs: ACK_WAIT_MS })); }
catch (e) { if (!/exists|already/i.test(String(e))) throw e; }
const pool = await js.consumers.get(epwStreamName(SPACE), poolDurable(ENDPOINT, POOL));
log(`pool ready: ${ENDPOINT}/${POOL} ack_wait=${ACK_WAIT_MS}ms`);

// --- enqueue exactly one work item: the benchmark task ---------------------------------
const RUN_ID = `reclaim-${T0}`;
const workExpiry = T0 + CAP_S * 1000; // identity-bound: same value on EVERY lease call
const ref = {
  endpoint: ENDPOINT, pool: POOL,
  acceptance: { owner: "u_hh", actor: "runner", uid: "hhreclaimhhreclaimhhreclai", id: RUN_ID },
};
const itemBytes = new TextEncoder().encode(JSON.stringify({ work: WORK, doneWhen: "python3 test.py PASS" }));
const enq = await enqueueWorkItem(ctx, ref, itemBytes);
log(`enqueued work item seq=${enq.seq} id=${RUN_ID}`);

const workerOf = (name) => ({ kind: "agent", owner: "u_hh", actor: name, lifecycleUid: (name.replace(/[^a-z0-9]/gi, "") + "x".repeat(26)).slice(0, 26).toLowerCase() });

let assignee = null, lease = null, lastMsg = null, reassignments = 0;

async function fetchOne(expiresMs) {
  for await (const m of await pool.fetch({ max_messages: 1, expires: expiresMs })) return m;
  return null;
}

// first delivery → first lease → first DM
{
  const m = await fetchOne(10000);
  if (!m) { log("FATAL: enqueued item never delivered to owner"); process.exit(1); }
  lastMsg = m;
  const candidates = idleBuilders();
  if (!candidates.length) { log("FATAL: no idle builders on the roster"); process.exit(1); }
  assignee = candidates[0];
  lease = await leaseWorkItem(ctx, { ref, sourceSeq: m.seq, attempt: m.info.deliveryCount, worker: workerOf(assignee), now: Date.now(), leaseTtlMs: LEASE_TTL_MS, workExpiry });
  log(`LEASED attempt=${lease.attempt} fencingToken=${lease.fencingToken} → ${assignee} (deliveryCount=${m.info.deliveryCount})`);
  dmTask(assignee);
}

// owner loop: hold the message unacked; every redelivery is a liveness checkpoint.
let lastTest = 0, done = false;
while (Date.now() < workExpiry) {
  const m = await fetchOne(5000); // pulse; the item redelivers only after ack_wait
  if (m) {
    lastMsg = m;
    const alive = builderAlive(assignee);
    log(`redelivery deliveryCount=${m.info.deliveryCount} — assignee ${assignee} is ${alive ? "alive" : "OFFLINE"}`);
    if (!alive) {
      const next = idleBuilders().filter((b) => b !== assignee)[0];
      if (!next) { log("no idle builder available for reassignment yet — holding"); }
      else {
        lease = await leaseWorkItem(ctx, { ref, sourceSeq: m.seq, attempt: m.info.deliveryCount, worker: workerOf(next), now: Date.now(), leaseTtlMs: LEASE_TTL_MS, workExpiry });
        reassignments++;
        log(`RE-LEASED attempt=${lease.attempt} fencingToken=${lease.fencingToken} → ${next} (was ${assignee}, killed)`);
        assignee = next;
        dmTask(assignee);
      }
    }
  }
  if (Date.now() - lastTest > 10000) {
    lastTest = Date.now();
    if (testPasses()) { done = true; break; }
  }
}

if (!done) {
  log(`RESULT pass=false DNF at cap=${CAP_S}s assignee=${assignee} attempt=${lease?.attempt} reassignments=${reassignments}`);
  process.exit(1);
}

// settle: commit as the worker that held the winning lease, publish + read the terminal fact
const commit = await commitWorkItem(ctx, {
  ref, caller: workerOf(assignee),
  lease: { sourceSeq: lease.sourceSeq, attempt: lease.attempt, fencingToken: lease.fencingToken },
  outcome: { pass: true, task: WORK, seconds: Math.round((Date.now() - T0) / 1000), reassignments },
  now: Date.now(),
});
log(`COMMITTED won=${commit.won} disposition=${commit.fact?.disposition} worker=${commit.fact?.worker?.actor} attempt=${commit.fact?.attempt} fencingToken=${commit.fact?.fencingToken}`);
const terminal = await readWorkTerminal(ctx, ref);
log(`TERMINAL FACT: ${JSON.stringify(terminal)}`);
try { lastMsg?.ack(); } catch {}
log(`RESULT pass=true total=${Math.round((Date.now() - T0) / 1000)}s reassignments=${reassignments} finisher=${assignee}`);
await nc.close();
process.exit(0);
