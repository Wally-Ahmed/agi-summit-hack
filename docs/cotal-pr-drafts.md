# Cotal upstream PR drafts (ready to submit — Wally approves & fires)

Branches live on the fork, built + import-verified against in-tree `connector-core` 0.12.0:

- `Wally-Ahmed/Cotal:add-connector-codex` → `Cotal-AI/Cotal:main`
- `Wally-Ahmed/Cotal:add-connector-agy` → `Cotal-AI/Cotal:main`

Submit with (after review):

```bash
gh pr create --repo Cotal-AI/Cotal --head Wally-Ahmed:add-connector-codex \
  --title "Add connector-codex: OpenAI Codex CLI as an autonomous mesh worker" \
  --body-file docs/pr-body-codex.md
gh pr create --repo Cotal-AI/Cotal --head Wally-Ahmed:add-connector-agy \
  --title "Add connector-agy: Google Antigravity CLI as an autonomous mesh worker" \
  --body-file docs/pr-body-agy.md
```

---

## PR 1 — connector-codex

**Title:** Add connector-codex: OpenAI Codex CLI as an autonomous mesh worker

**Body:**

This adds `extensions/connector-codex`, which spawns the OpenAI Codex CLI as a full mesh
worker: `cotal spawn worker --agent codex --detach`.

**Design.** A thin Node shim owns the mesh agent and drives Codex headlessly one turn at a
time: the first turn runs `codex exec`, every later turn `codex exec resume <threadId>`, so
the worker keeps conversation state across mesh messages. The shim serves the `cotal_*`
tools to Codex over MCP. Delegation is push-based — the mesh wakes the worker; the worker
never polls. Auth is whatever the local `codex` binary already has (ChatGPT subscription
login or a configured API provider), under the operator's own account.

**Relationship to the npm `@cotal-ai/connector-codex` 0.1.4.** That package is the
pull-side experiment (a session joins the mesh; the mesh cannot wake Codex) on
connector-core 0.2.0. This connector is the autonomous-worker half, on connector-core
0.12.0. If you'd like both to coexist I'm happy to rename this one — otherwise it can
supersede at the next minor.

**Testing.** Builds in-tree (`pnpm --filter @cotal-ai/connector-codex... run build`;
bundle imports clean). Live-verified on a real mesh: spawn joins under the manager, DM
round-trip, multi-turn thread resume holds context, clean stop. We've also run it as a
benchmark arm across a 20+ task suite (hermetic, subscription-authed) without a dropped
turn.

**Notes for reviewers.**
- Codex's default approval policy auto-cancels MCP tool calls in headless runs; the shim
  passes `--dangerously-bypass-approvals-and-sandbox` on `exec`.
- `codex exec` slurps stdin when handed an open pipe; the shim closes stdin explicitly.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_012MLLWMoW1gTp8fft1bWNQv

---

## PR 2 — connector-agy

**Title:** Add connector-agy: Google Antigravity CLI as an autonomous mesh worker

**Body:**

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

**Deliberate v1 limits (all fail loudly rather than silently degrade):**
- One agy worker per machine — agy only reads the global MCP config, so the shim refuses
  to start if a `cotal` entry already exists (a stale entry from an unclean shutdown must
  be deleted first).
- `supportsModelVariant: false` — agy bakes the reasoning level into the model display
  name (e.g. "Gemini 3.1 Pro (High)"), selected via `COTAL_MODEL`.
- `COTAL_AGY_STATELESS=1` opts into a rolling-digest fallback (persona + recent
  transcript per turn) if conversation resume misbehaves in a future agy release.

**Testing.** Builds in-tree; bundle imports clean. Live-verified on a real mesh: spawn
joins, mcp_config merge preserves existing entries, DM round-trip publishes to a channel,
multi-turn resume holds context, stop removes the MCP entry cleanly. Also used as a
benchmark arm across a 20+ task hermetic suite — including runs where agy's native
harness beat a foreign harness driving the same Gemini model by ~1.75× at equal quality.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_012MLLWMoW1gTp8fft1bWNQv
