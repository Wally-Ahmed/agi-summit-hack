This adds `extensions/connector-agy`, which spawns Google's Antigravity CLI (`agy`) as a
full mesh worker: `cotal spawn worker --agent agy --detach`.

**Design.** A Node shim owns the mesh agent and runs `agy -p` one turn at a time under a
pseudo-TTY (agy drops its final response on a non-TTY stdout while exiting 0). The first
turn's log yields the conversation id; later turns pass `--conversation <id>` so context
persists, and the shim fails loudly if a resume turn unexpectedly creates a fresh
conversation. The `cotal_*` tools are served over a local streamable-HTTP MCP endpoint,
merged into the global `~/.gemini/config/mcp_config.json` for the worker's lifetime and
removed on shutdown and process exit. `--add-dir <workRoot>` is passed on every turn so
artifacts land in the work directory instead of agy's own workspace scratch.

**Code standards.** TypeScript under the shared strict `tsconfig.base.json` (NodeNext,
`verbatimModuleSyntax`), typed against the `Connector` / `LaunchOpts` / `LaunchSpec`
surface. The package contract mirrors the sibling connectors: `types` field + `types`
exports condition, `typecheck` script, declaration emit + esbuild bundles in `build`,
`files` whitelist, `publishConfig`, `prepublishOnly`. `@cotal-ai/connector-agy` is added
to the changesets `fixed` group so it versions in lockstep, and `pnpm-lock.yaml` carries
the new workspace importer (`pnpm install --frozen-lockfile` verified).

**Prior art.** No Antigravity connector has existed in-tree or on npm. The existing
connectors all deliver by pushing into a *live* harness process — hook-injected context at
turn boundaries (Claude Code), API-injected turns (OpenCode), a bridge socket (Hermes),
mid-turn steering (pi) — which requires a cooperation surface the closed `agy` binary
doesn't offer: no lifecycle hooks, no wake-notification channel, no server/host mode, not
even a per-invocation MCP flag. This connector therefore uses the same push-by-respawn
pipeline as the sibling Codex PR (#254): the persistent process is the shim, and each
drained inbox batch becomes a fresh `agy -p --conversation <id>` turn — no idle session
ever needs waking. If agy later ships hooks or a host API, a live-session connector can
layer on without changing the mesh-facing contract.

**Deliberate v1 limits (all fail loudly rather than silently degrade):**
- One agy worker per machine — agy only reads the global MCP config, so the shim refuses
  to start if a `cotal` entry already exists (a stale entry from an unclean shutdown must
  be deleted first).
- `supportsModelVariant: false` — agy bakes the reasoning level into the model display
  name (e.g. "Gemini 3.1 Pro (High)"), selected via `COTAL_MODEL`.
- `COTAL_AGY_STATELESS=1` opts into a rolling-digest fallback (persona + recent
  transcript per turn) if conversation resume misbehaves in a future agy release.

**Testing.** Builds in-tree (`pnpm --filter "@cotal-ai/connector-agy..." run build`),
`pnpm --filter @cotal-ai/connector-agy run typecheck` passes, the esm bundle imports
clean, and `pack --dry-run` ships exactly `dist/` + manifest. Live-verified on a real
mesh with this same shim logic: spawn joins, mcp_config merge preserves existing entries,
DM round-trip publishes to a channel, multi-turn resume holds context, stop removes the
MCP entry cleanly. Also used as a benchmark arm across a 20+ task hermetic suite —
including runs where agy's native harness beat a foreign harness driving the same Gemini
model by ~1.75× at equal quality.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_012MLLWMoW1gTp8fft1bWNQv
