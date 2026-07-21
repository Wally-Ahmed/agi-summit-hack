This adds `extensions/connector-codex`, which spawns the OpenAI Codex CLI as a full mesh
worker: `cotal spawn worker --agent codex --detach`.

**Design.** A thin Node shim owns the mesh agent and drives Codex headlessly one turn at a
time: the first turn runs `codex exec`, every later turn `codex exec resume <threadId>`, so
the worker keeps conversation state across mesh messages. The shim serves the `cotal_*`
tools to Codex over MCP. Delegation is push-based — the mesh wakes the worker; the worker
never polls. Auth is whatever the local `codex` binary already has (ChatGPT subscription
login or a configured API provider), under the operator's own account.

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
