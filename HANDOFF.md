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

**Multi-harness orchestration system built around Cotal.ai.** Wally is a *participant* in the AGI
Summit 2026 Hackathon (not a judge). The real build:

- A **main harness ("Hermes")** handles long-running tasks but does **not execute them itself** — it
  *outlines/plans* a task, then **hands it off to a different harness**: Claude Code, Gemini CLI,
  Codex CLI, etc. Each sub-harness runs under its **own legitimate auth/subscription**.
- **Goal / framing:** legitimately route work across *official* provider harnesses to stay within
  fair use while working around third-party-harness restrictions. The compliant interpretation we
  build to: **orchestrate official CLIs** — never bypass auth or reverse-engineer tokens.
- **Benchmark objective:** compare **Cotal-based coordination** vs. spinning up third-party
  subagents via MCP (openrouter MCP, gpt-subscription MCP, kilo MCP).
- **First concrete step:** convert the existing MCP servers to **CLI versions** — specifically
  `openrouter-subagents` (openrouter MCP) and `gpt-subagents-subscription` (gpt subscription MCP).
- **Win condition (Wally's answers):** "Both" — our hackathon *submission* AND a genuinely
  operational tool. Judging role = "hybrid: agents screen, humans decide" — **now obsolete**, kept
  only as history. Naturally targets the **Cotal.ai sponsor prize ($500)**.

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

## Next steps

1. Wally: activate auto-memory hooks (`mv .claude/settings.json.proposed .claude/settings.json`).
2. On the cloud machine (Codespace or other): clone → `bash bootstrap.sh` → `claude` + `/login`.
3. Verify all layers on the server, then resume the actual build
   (start with the MCP→CLI conversion of openrouter + gpt-subscription).

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
