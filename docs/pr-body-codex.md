This adds `extensions/connector-codex`, which spawns the OpenAI Codex CLI as a full mesh
worker: `cotal spawn worker --agent codex --detach`.

**Design.** A thin Node shim owns the mesh agent and drives Codex headlessly one turn at a
time: the first turn runs `codex exec`, every later turn `codex exec resume <threadId>`, so
the worker keeps conversation state across mesh messages. The shim serves the `cotal_*`
tools to Codex over MCP. Delegation is push-based — the mesh wakes the worker; the worker
never polls. Auth is whatever the local `codex` binary already has (ChatGPT subscription
login or a configured API provider), under the operator's own account.

**The shim, in detail.** The persistent process `cotal spawn` launches is not Codex — it
is a small Node supervisor (`dist/serve.js`) that owns everything durable about the
worker: the `MeshAgent` identity and inbox from connector-core, and a loopback MCP
endpoint. That endpoint is a streamable-HTTP server on an ephemeral `127.0.0.1` port that
constructs a fresh `McpServer` per request (`sessionIdGenerator: undefined`), so there is
no MCP session state to lose across harness respawns — every request binds to the one
long-lived agent. Codex is pointed at it per invocation with
`-c mcp_servers.cotal.url="…"`, so nothing global is touched.

Delivery is event-driven, never polled. `agent.on("incoming")` schedules a wake with a
300 ms debounce so a burst of peer messages coalesces into one turn; explicit wake and
mention events schedule immediately. The pump is single-flight: while `pendingWake() > 0`
it drains the inbox, formats the batch into one injection prompt (the
`📨 Cotal — N new message(s)` block, one bullet per item, reply instructions appended),
and runs exactly one harness turn. Messages that arrive mid-turn simply buffer in the
inbox; the loop re-checks after the child exits, so they become the next turn.

A turn is a fresh process: `codex exec` the first time, `codex exec resume <threadId>`
after that, with `--json --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox`
(headless Codex otherwise auto-cancels MCP calls), optional `--model` and
`-c model_reasoning_effort=…`, and the prompt delivered on stdin (`-`) with stdin then
closed — immune to argv length limits and leading-dash text. Stdout is newline-JSON:
`thread.started` mints the thread id exactly once, and success requires `turn.completed`,
not just exit 0. The child environment is a copy of the shim's with every `COTAL_*`
variable stripped, so a harness can never inherit mesh identity. Presence flips to
`working` for the duration of the turn and back to `idle` in the pump's `finally`.

Because all conversational memory lives server-side in the Codex thread, crash-tolerance
is structural rather than added on: a wedged turn hits the 15-minute timeout and is
SIGKILLed, and the next wake spawns a process that resumes the same thread. The delivery
semantics into the harness are deliberately at-most-once, and worth stating plainly for
review: `drainInbox` acks durables at drain time — before the child spawns — and the
failure branch breaks rather than retries ("don't spin — wait for the next wake"), so a
batch whose turn died after drain is not redelivered; it survives only in the shim's log.
We took that trade because replaying a possibly-half-executed agent turn replays its side
effects. A rotating `handledIds` window deduplicates live/durable copies, so the
at-most-once guarantee holds from the broker all the way into the model's context.

**Code standards.** TypeScript under the shared strict `tsconfig.base.json` (NodeNext,
`verbatimModuleSyntax`), typed against the `Connector` / `LaunchOpts` / `LaunchSpec`
surface. The package contract mirrors the sibling connectors: `types` field + `types`
exports condition, `typecheck` script, declaration emit + esbuild bundles in `build`,
`files` whitelist, `publishConfig`, `prepublishOnly`. `@cotal-ai/connector-codex` is added
to the changesets `fixed` group so it versions in lockstep, and `pnpm-lock.yaml` carries
the new workspace importer (`pnpm install --frozen-lockfile` verified).

**Prior art & lineage.** Three Codex architectures have existed around this repo, and this
PR is deliberately the third:

1. *Pull-only* — the npm `@cotal-ai/connector-codex` 0.1.x experiment (connector-core
   0.2.0): Codex sandboxes lifecycle hooks away from the control socket and has no
   `claude/channel` analog to wake an idle TUI, so the model was asked to poll
   `cotal_inbox`. Removed in 5b3eb21e (archived on `archive/connector-codex`) after
   headless sessions joined the mesh but never acted on it.
2. *Live host-mode* — #97 drives a `codex app-server` thread over JSON-RPC
   (`turn/start` / `turn/steer`): true live-session push with mid-turn steering,
   currently reply-driven.
3. *Push-by-respawn (this PR)* — the persistent process is the shim, not the harness, so
   the idle-wake problem never arises: each drained inbox batch becomes a fresh
   `codex exec resume <threadId>` turn, and the agent keeps full deliberate `cotal_*`
   tool use. It needs only `exec` + `resume` from Codex — no hooks, no wake channel, no
   host server. Complementary to #97 rather than competing (host-mode buys steering;
   respawn buys minimal harness surface). If you'd like the npm name reserved for a
   future host connector I'm happy to rename this one — otherwise it can supersede at
   the next minor.

**Testing.** Builds in-tree (`pnpm --filter "@cotal-ai/connector-codex..." run build`),
`pnpm --filter @cotal-ai/connector-codex run typecheck` passes, the esm bundle imports
clean, and `pack --dry-run` ships exactly `dist/` + manifest. Live-verified on a real
mesh with this same shim logic: spawn joins under the manager, DM round-trip, multi-turn
thread resume holds context, clean stop. We've also run it as a benchmark arm across a
20+ task suite (hermetic, subscription-authed) without a dropped turn.

**Notes for reviewers.**
- Codex's default approval policy auto-cancels MCP tool calls in headless runs; the shim
  passes `--dangerously-bypass-approvals-and-sandbox` on `exec`.
- `codex exec` slurps stdin when handed an open pipe; the shim closes stdin explicitly.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_012MLLWMoW1gTp8fft1bWNQv
