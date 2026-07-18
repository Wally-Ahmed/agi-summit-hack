# HANDOFF — agi-summit-hack

> **Standing cross-session / compact-recovery file.** If you (Claude) are reading this after a
> crash, `/compact`, or fresh session: this is the single source of truth. Read it once, then act.
> **Keep it current** — update Status / Next steps / Decisions after every milestone and before
> context gets long. Verify claims against `git log --oneline -5` and `ls` before trusting them.

_Last updated: 2026-07-18 ~15:45 EDT (session 1 post-compact — cloud setup executed)_

## ⚠️ Read first after a compact

1. **MemPalace MCP drops on every `/compact`** (silent, no data loss). Check
   `mcp__plugin_mempalace_mempalace__*` tools; if disconnected, ask Wally to run `/plugin` or `/mcp`
   to revive. Until then, use file memory + graphify. (Also in CLAUDE.md.)
2. **Cloud setup is DONE** (private repo `Wally-Ahmed/agi-summit-hack`, bootstrap.sh,
   SERVER_SETUP.md, `.memory/` mirror). See Migration section for what remains manual.
3. The project is **NOT a judging platform** — that was the original misframing. See Project below.

## Project (CURRENT — supersedes the "judging platform" idea)

**Cotal.ai mesh with the EXISTING Hermes as planner.** Wally is a *participant* in the AGI
Summit 2026 Hackathon (not a judge). The real build (corrected 2026-07-18 ~17:15 — we are NOT
building a new harness; "Hermes" = the existing Nous Research `hermes-agent`, already a Cotal
connector: `cotal spawn --agent hermes`):

- **Existing Hermes** is the mesh's planner/supervisor: it *outlines/plans* long-running tasks and
  **hands execution to other harness connectors** — Claude Code (connector exemplar exists in the
  Cotal repo), Gemini CLI, Codex CLI candidates. Each harness runs under its **own legitimate
  auth/subscription** (fair-use compliant; never bypass auth or reverse-engineer tokens).
- **Benchmark objective:** Cotal-mesh coordination (Hermes → connectors) vs. direct subagents.
  **Subagent pool (scope decision 2026-07-18): `openrouter-subagents` CLI + `gpt-subagents-api`
  MCP only. `gpt-subagents-subscription` is DROPPED from the hackathon. Wally personally owns
  `gpt-subagents-api` updates (it has his uncommitted WIP — HANDS OFF that repo).**
- **Win condition:** "Both" — hackathon *submission* AND an operational tool. Targets the
  **Cotal.ai sponsor prize ($500)**.

### Cotal.ai (the core dependency — researched 2026-07-18)
- Open standard **protocol for AI-agent coordination**: "one protocol, any topology" (peer-to-peer,
  supervised, hierarchical, hybrid).
- Agent manifest at `/.well-known/cotal.json`; API catalog at `/.well-known/api-catalog`
  (RFC 9727 linkset); OpenAPI at `/openapi.json`; LLM entry at `/llms.txt`.
- Spec v0.1 living draft. GitHub org **github.com/cotal-ai**, main repo `cotal` (TypeScript,
  Apache-2.0, ~195★). Reference impl ships a **TypeScript SDK + CLI**. Still need to read the wire
  contract / message format from the repo before designing on it.

### Event
AGI Summit 2026 Hackathon, Palace of Fine Arts, SF. Two-day. Prizes: 1st $1,000 / 2nd $700 /
3rd $300; InsForge sponsor $500; **Cotal.ai sponsor $500**. Categories include Multi-Agent Systems,
AI Infra Tools, OpenClaw Integrations.

## Memory-layer inventory (what's portable vs. machine-local)

| Layer | State | Portable? |
|---|---|---|
| **git** | branch `main`, last commit `5cab573`, **no remote yet** | needs a remote to travel |
| **graphify** | `graphify-out/` git-tracked (graph.json, GRAPH_REPORT.md, graph.html); `cache/` gitignored. Tool: `uv tool graphifyy` v0.8.39, interpreter pinned in `graphify-out/.graphify_python` | ✅ via git + reinstall tool |
| **mem-palace** | v3.4.0; `mempalace.yaml` tracked; `.mempalace/` (vector DB) gitignored — **re-mine on server** with `mempalace mine .` | ✅ config travels; DB rebuilds |
| **claude-mem** | v12.4.7 (brew), data in `~/.claude-mem` (~1.5 GB, machine-local). Auto-captures sessions | ⚠️ machine-local — export/sync needed |
| **file memory** | `~/.claude/projects/-Users-wally-Documents-GitHub-agi-summit-hack/memory/` (MEMORY.md + standing-handoff.md) | ⚠️ machine-local — mirror into repo to travel |
| **auto-memory** | **NOT set up.** Global hooks are empty (`{}`). No auto-memory plugin found (plugins: claude-plugins-official, mempalace, thedotmack, zero-plugins) | ❓ see open decision |

## Cloud-server migration (EXECUTED 2026-07-18)

Reason: local wifi too slow to build. The repo is the transport; see `SERVER_SETUP.md`.

Done:
1. **Private GitHub remote**: `Wally-Ahmed/agi-summit-hack` (private — sensitive framing).
2. **File memory mirrored** into `.memory/`; `scripts/sync-memory.sh push|restore` moves it
   between repo and `~/.claude/projects/<slug>/memory/` (slug computed per-machine).
3. **`bootstrap.sh`** (idempotent): installs uv → graphifyy → mempalace → Claude Code CLI,
   re-mines `.mempalace/`, re-pins graphify interpreter, restores file memory, verifies.
4. **claude-mem**: fresh DB on server; recent context travels via CLAUDE.local.md (full ~1.5 GB
   Mac history stays local — accepted trade-off).
5. **Auto-memory**: `scripts/sync-memory.sh` + hook config staged at
   `.claude/settings.json.proposed` (PreCompact + SessionEnd → memory push). Activating hooks
   needed Wally's explicit approval (auto-mode blocked it):
   `mv .claude/settings.json.proposed .claude/settings.json`

Manual per-machine steps (cannot script): `claude` → `/login`; `/plugin` to reinstall mempalace
MCP; activate the proposed hooks.

## Status (2026-07-18 ~16:45 EDT)

**Codespace LIVE + fully bootstrapped**: `glowing-acorn-q79w9x4vj4wx3xrgj` (2-core, 30-min idle).
Connect: `gh codespace ssh -c glowing-acorn-q79w9x4vj4wx3xrgj` (or VS Code/web). On it:
- All memory layers verified (git, graphify, mempalace palace at `~/.mempalace/palace`, file
  memory restored). Claude CLI 2.1.214, Wally logged in (**different account than the Mac**).
- `~/.claude/settings.json` set to **`model: claude-fable-5`, `effortLevel: xhigh`** (Wally's
  standing instruction for all cloud sessions).
- **openrouter-subagents CLI**: cloned to `/workspaces/openrouter-subagents`, built, npm-linked,
  `.env` (API key) copied over SSH, **live-tested OK** (`openrouter-subagents ask -m ...`).
- **gpt-subagents-subscription CLI**: cloned/built/linked at fa8c34b, patterns verified; NOT
  ChatGPT-authenticated there (needs `gpt-subagents-subscription login` + port-forward 1455).

**MCP→CLI conversion**: openrouter already had a CLI twin (pre-existing). I built the
gpt-subscription CLI this session — `src/cli.ts` (ask/usage/patterns/pattern/login), 10 unit
tests, README section, live-tested on the Mac — commits `da66a9e` + `fa8c34b` pushed to
`Wally-Ahmed/gpt-subagents-subscription`. **fa8c34b also committed Wally's previously
uncommitted working tree** (gpt-5.6 models, none→max effort, HTTP transport) — required for
remote clones to compile.

**⚠️ Wally is now RESTRUCTURING gpt-subagents-subscription himself** (his message ~16:40) and
will update us. HANDS OFF that repo (local + remote + the Codespace clone) until he says
otherwise. The Codespace clone/link may go stale during his restructure — rebuild it after
(`git pull && npm i && npm run build && npm link`).

## Next steps

1. ✅ Cotal wire-contract research DONE → **`docs/cotal-wire-contract.md`** (read it before any
   orchestrator design). Headlines: NATS/JetStream not HTTP; NO task lifecycle in Cotal (our
   orchestrator's value-add); "Hermes" name COLLIDES with an existing Cotal connector (Nous
   Research) — needs Wally's rename decision; easiest harness integration = Connector plugin
   (Claude Code exemplar exists).
2. **Mesh spec (Wally, 2026-07-18 ~17:25):** existing **Hermes runs persistently as planner**,
   hands each task off so **the user's own subscription finishes it** — workers: **Claude Code**
   (Claude subscription; connector exemplar exists in Cotal repo) and **Codex CLI** (ChatGPT
   subscription; NO Cotal connector exemplar known — likely author one via the easy-path
   `Connector` interface). (in flight) research on connect-hermes.md / hermes-agent
   install+auth / Claude Code connector / personas.
3. Benchmark arm 2 ready on Codespace: `openrouter-subagents` + `gpt-subagents-api` MCP servers
   registered with Claude Code (user scope), both **✔ Connected**; `.env` keys copied. gpt-api
   updates are Wally's (his WIP is uncommitted on the Mac — hands off).
4. Wally: activate auto-memory hooks (`mv .claude/settings.json.proposed .claude/settings.json`).
5. ✅ **MESH IS LIVE + FIRST HANDOFF SUCCEEDED (2026-07-18 ~21:21 UTC).** On the Codespace:
   `cotal up` (nats+delivery+manager), planner = Hermes connector, worker = Claude Code
   (**verified running Fable 5 xhigh on Claude Max**). End-to-end test passed: anycast task →
   planner delegated (never executed) → worker wrote `mesh-handoff-proof.txt`, self-verified
   (cat+xxd), DM'd STATUS/EVIDENCE + posted #results → planner independently re-verified.
   **Fixes applied to get here (all documented in `docs/hermes-mesh-runbook.md`):**
   (a) `hermes` bin must be on PATH → `uv tool install "hermes-agent>=0.16,<0.17"`;
   (b) connector-hermes 0.12.0 ESM bundle crash (`Dynamic require of "crypto"`) → 2-line
   createRequire shim prepended to `~/.config/cotal/extensions/.../dist/launch.js`
   (backup `launch.js.orig`; consider `cotal feedback` upstream — needs Wally's OK);
   (c) detached spawns inherit the MANAGER's env → restart stack with
   `OPENROUTER_API_KEY` + `HERMES_MODEL` exported (also appended to ~/.bashrc, interactive
   shells only); (d) `HERMES_MODEL` takes a BARE OpenRouter id (`anthropic/claude-sonnet-4.6`),
   no `openrouter:` prefix; (e) NO nousresearch/* model on OpenRouter supports tool calls —
   planner brain must be tool-capable (sonnet-4.6 chosen; deepseek-chat-v3.1 = cheap alt);
   (f) worker permission prompts need manual Enter via `cotal attach` — for unattended runs,
   configure auto-accept on the claude connector spawn (TODO).
6. **NEW DIRECTIVE (Wally, ~22:30 UTC, full permission granted):** benchmark matrix, ALL at
   xhigh: (a) Opus 4.8 on Codex-harness (via OpenRouter) vs Claude-Code-harness — RUNNING NOW;
   (b) then on a NEW BRANCH: Cotal↔Google-Antigravity-CLI connector, Gemini on all harnesses,
   MCP/CLI tools for Antigravity, test GPT + Opus 4.8 there (research in flight).
6a. **THREE-HARNESS MESH PROVEN (2026-07-18 ~22:40 UTC, branch `antigravity`):**
   `cotal-connector-codex` built/installed/tested (commit `ca6d347`, source in
   `connectors/` + standalone repo at /workspaces/cotal-connector-codex; worker2 spawn +
   DM round-trip verified, needs `--dangerously-bypass-approvals-and-sandbox` or MCP calls
   get auto-cancelled). Hands-free handoff VERIFIED end-to-end (allow-list must include
   `mcp__cotal`; permission changes need worker respawn). Suite v2 results in
   `benchmark/RESULTS.md`: Opus 4.8 8/8 on both harnesses, Codex ~5× faster on hard tasks.
   **⚠️ BLOCKER: OpenRouter balance $0.47 (of $435) — Opus turns 402; planner STOPPED to
   silence error spam (respawn after top-up: export OPENROUTER_API_KEY +
   HERMES_MODEL=anthropic/claude-sonnet-4.6, `cotal spawn planner --agent hermes --detach`).**
   **⚠️ BLOCKER 2: Antigravity `agy` 1.1.4 installed + MCP wired (~/.gemini/config/
   mcp_config.json) but needs Wally's interactive Google sign-in (`agy` in the Codespace).**
7. State: gpt-api update committed+pushed (`08a348d`, his cli.ts; Codespace synced).
   Worker perms: acceptEdits + allow-list in Codespace ~/.claude/settings.json
   (bypassPermissions FAILS for spawns — interactive confirm dialog kills the pty).
   **Codex CLI 0.144.6 on Codespace runs Opus 4.8 via OpenRouter**: ~/.codex/config.toml →
   model_provider openrouter (base_url https://openrouter.ai/api/v1, env_key
   OPENROUTER_API_KEY, wire_api "responses" — "chat" was REMOVED in 0.144; OpenRouter speaks
   Responses natively), model anthropic/claude-opus-4.8, model_reasoning_effort xhigh,
   openrouter-subagents registered as MCP. Smoke test passed.
   Benchmark suite: `benchmark/` (3 tasks + run.sh; results to benchmark/results/*.jsonl;
   fairness: CLAUDE.local.md excluded from workdirs). Codex-mesh connector build plan:
   `docs/codex-connector-plan.md` (task #10, pending).
   Hands-free mesh handoff re-test (task #9) still pending — interrupted by the redirect.

## Recovery / revival procedures

- **Graphify queries:** `graphify query "<q>"` whenever `graphify-out/graph.json` exists.
- **Session file memory:** `~/.claude/projects/-Users-wally-Documents-GitHub-agi-summit-hack/memory/`
  (MEMORY.md is the index; standing-handoff.md points back here).
- **Rules of engagement:** repo `CLAUDE.md` — graphify-first, low-token, MemPalace only for
  past-decision recall; all patterns apply to subagents too.
- **Brainstorm visual companion** (may be stale): server was on port 52828, session dir
  `.superpowers/brainstorm/58287-1784399922/`. Auto-exits after 30 min idle; restart via
  `superpowers/.../brainstorming/scripts/start-server.sh --project-dir <repo>` if needed.

## Handoff protocol (maintain this!)

1. Update Status / Next steps / Decisions after each milestone — not just at session end.
2. Record in-flight work: which file, what change, what was about to happen.
3. Commit this file with the work it describes (`git add HANDOFF.md`).
4. On recovery: read this first, verify against `git log` + `ls`, continue from Next steps.

## Decisions log

- 2026-07-18: Bootstrapped graphify + MemPalace + git + HANDOFF before any code so tooling/memory
  survive from minute one.
- 2026-07-18: Project redefined from "judging platform" → **multi-harness orchestrator around
  Cotal.ai** with a Cotal-vs-MCP-subagents benchmark. First deliverable = MCP→CLI conversion of
  openrouter + gpt-subscription servers.
- 2026-07-18: Moving dev to a cloud server (slow local wifi); private GitHub remote is the transport;
  memory layers preserved via git + re-mine + reinstall.
- 2026-07-18 (post-compact): Cloud setup executed — private repo `Wally-Ahmed/agi-summit-hack`,
  bootstrap.sh + SERVER_SETUP.md, `.memory/` mirror + sync script. claude-mem starts fresh on
  server (recent context rides in CLAUDE.local.md). Auto-memory hooks staged as
  `.claude/settings.json.proposed` — activation requires Wally (auto-mode denied writing live
  hooks; that was self-modification territory).
