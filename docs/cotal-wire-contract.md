# Cotal wire contract — engineering brief for the orchestrator

_Researched 2026-07-18 from github.com/Cotal-Ai/Cotal (branch `main`, Apache-2.0), SPEC.md
(normative, self-describes wire v0.2 pre-1.0), spec/cotal.schema.json (authoritative shapes),
docs/. cotal.ai/llms.txt still says "v0.1" and links a 404 doc — trust SPEC.md over the site._

## Three findings that change our design

1. **Transport is NATS + JetStream, NOT HTTP.** Agents expose zero HTTP endpoints. The
   `/.well-known/cotal.json` on cotal.ai is a *site* descriptor, not a per-agent requirement.
   Our earlier assumption of HTTP handoffs is wrong.
2. **Cotal has NO task lifecycle.** Explicitly rejects A2A's Task RPCs: no task envelope, no
   submitted/working/completed states, no result message type. Delegation = an anycast message;
   claim = JetStream ack; result = an ordinary reply correlated by `replyTo`/`contextId`.
   **The task-state machine is the orchestrator's value-add** — layer it in `data` parts or an
   extension Part kind (reverse-DNS, e.g. `ai.hermes.task`).
3. **Name collision: Cotal already ships a "Hermes" connector** (Nous Research's `hermes-agent`
   CLI as a gateway daemon, `cotal spawn --agent hermes`). Our orchestrator needs a different
   name or it collides with an ecosystem term.

## Wire message (`CotalMessage`)

UTF-8 JSON over JetStream, `msgID = id`, receivers dedupe by `id`:

```json
{
  "id": "018f1d0a-...",
  "ts": 1710000000000,
  "space": "main",
  "from": {"id": "u_<26xbase32>.alice", "name": "alice", "role": "planner"},
  "channel": "team.backend",
  "parts": [{"kind": "text", "text": "..."}, {"kind": "data", "data": {}}],
  "replyTo": "<message id>",
  "contextId": "ctx-1"
}
```

- Routing: exactly ONE of `channel` (multicast) | `to` (unicast, at-least-once) | `toService`
  (anycast — one role instance claims off the `TASK_<space>` WorkQueue via `svc_<role>` durable).
- Part kinds: `text`, `data`, or extension kinds matching `^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$`.
- Identity: principal `<owner>.<actor>`, owner `u_`+26 base32 (or `local` on open dev meshes).
- Subjects: `cotal.<space>.{chat|inst|svc|ctl}...`; receivers derive delivery kind from the
  subject and reject `malformed-subject` / `sender-mismatch` / `malformed-json`.
- Control plane: `ControlRequest {op, args, from}` → `ControlReply {ok, data?, error?}` on
  `cotal.<space>.ctl.<service>.<owner>.<actor>`.

## Capability declaration & topology

- Per-agent card lives in presence KV (heartbeat ~2s): `{card: {id, name, kind, role?, skills:
  [{id, name}], ...}, status: idle|waiting|working|offline, ...}`.
- Mesh manifest (`apiVersion: cotal/v1, kind: Mesh`) declares space/channels/ACLs. Supervision
  is a *convention*, not a primitive: tasks channel `allowPublish: [supervisor]`, results channel
  `subscribe: [supervisor]`, work assignment via `toService` anycast or DM. A manager daemon
  (`cotal supervise`) owns process lifecycle only, not task routing. Agents with the `spawn`
  capability can grow the team via `cotal_spawn` MCP tools.

## CLI / SDK

- `npm install -g cotal-ai` (Node 20+), binary `cotal`: `setup up down status meshes use`,
  `spawn ps stop attach personas supervise`, `send dm|msg|ask channels console web`,
  `mint login actor grant|revoke doctor auth join`, `topology view`, `ext add|remove|list`.
- SDK `@cotal-ai/core` v0.12.0 (NATS client layer, subjects, types, connector contracts).
  Sibling packages: `@cotal-ai/cli`, `@cotal-ai/manager`, `@cotal-ai/delivery`,
  `@cotal-ai/connector-core` (shared MCP bridge).
- Auth: local nkey (transport) + JWT minted by account key (`cotal mint <name> --profile
  agent|observer|admin`). Default-deny ACLs; broker forge-locks publish subjects.

## Minimal harness adapter (how we wrap Claude Code / Gemini CLI / Codex CLI)

**Easy path — Connector plugin** (the MCP bridge does the protocol): implement `Connector` from
`@cotal-ai/core` — `{kind: "connector", name, requires, buildLaunch(opts) => LaunchSpec{command,
args, env}}` — self-register via `registry.register(...)`, ship as `@you/cotal-connector-<name>`,
install with `cotal ext add`, run with `cotal spawn --agent <name>`. The wrapped harness then
receives work via the `cotal_inbox` MCP tool and reports via `cotal_send`/`cotal_dm`/
`cotal_anycast` (18 `cotal_*` tools total). **Exemplars already exist for Claude Code, OpenCode,
Hermes(Nous), pi.**

**Hard path — native NATS client**: minted creds, bind `dm_<owner>-<actor>` durable + join
`svc_<role>` queue-group, heartbeat presence every 2s, validate/dedupe/ack, publish result as a
`CotalMessage` with `replyTo`/`contextId`. Reference: `packages/core/smoke/`.

## v0.x gaps we design around (explicit in spec/roadmap)

No task lifecycle/result contract; no supervisor primitive; no per-agent well-known discovery;
signed envelopes, DID identity, artifact parts, federation all deferred.
