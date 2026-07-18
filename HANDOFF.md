# HANDOFF — agi-summit-hack

> **Standing cross-session / compact-recovery file.** If you (Claude) are reading this after a
> crash, compact, or fresh session start: this file is the single source of truth for where work
> stands. Read it once, then act. **Keep it current** — update the Status and Next Steps sections
> after every significant milestone, and always before context gets long.

_Last updated: 2026-07-18 ~14:45 EDT (session 1 — bootstrap)_

## Project

- **What:** AGI Summit hackathon project. Code has not started yet — repo was bootstrapped today.
- **Where:** `/Users/wally/Documents/GitHub/agi-summit-hack` (git repo, branch `main`).
- **Related dir:** `/Users/wally/Documents/GitHub/HackWashingtonU/frontend/src/pages` is an
  additional working directory in the Claude session (prior hackathon frontend — possible reference
  material, not part of this repo).

## Current status

- [x] Graphify installed (uv tool `graphifyy` v0.8.39, binary `graphify` on PATH) and pipeline run
      end-to-end. Outputs in `graphify-out/` (graph.json, GRAPH_REPORT.md, graph.html). Corpus is
      currently just CLAUDE.md — rebuild with `graphify update` (or `/graphify . --update`) once
      real code lands.
- [x] MemPalace 3.4.0 initialized: `mempalace.yaml` + `.mempalace/` palace, 10 files mined
      (80 drawers, wing `agi_summit_hack`). Re-mine with `mempalace mine .` after adding content.
- [x] Git initialized on `main`; `.mempalace/` and `graphify-out/cache/` are gitignored.
- [x] This handoff file created and committed.
- [ ] Actual hackathon project: **not started, idea not yet defined.**

## Next steps

1. Get the hackathon idea/spec from Wally.
2. Scaffold the project; after first real code: `graphify update` + `mempalace mine .` + commit.
3. Keep this file updated (see protocol below).

## Recovery / revival procedures

- **MemPalace MCP drops after every `/compact`** (silent, no data loss). Check the
  `mcp__plugin_mempalace_mempalace__*` tools; if disconnected, ask Wally to run `/plugin` or `/mcp`
  to revive. Until then use file memory + graphify. (Also documented in CLAUDE.md.)
- **Graphify queries:** `graphify query "<question>"` — works any time `graphify-out/graph.json`
  exists. Interpreter pinned in `graphify-out/.graphify_python`.
- **Session memory:** persistent memory dir at
  `~/.claude/projects/-Users-wally-Documents-GitHub-agi-summit-hack/memory/` (MEMORY.md is the
  index; a pointer to this handoff lives there).
- **Rules of engagement:** CLAUDE.md in this repo — graphify-first context retrieval, low-token
  work, MemPalace only for past-decision recall, all patterns apply to subagents too.

## Handoff protocol (for Claude — maintain this!)

1. Update **Current status** / **Next steps** after each milestone (feature done, decision made,
   blocker hit) — not just at session end.
2. Record in-flight work explicitly: what file, what change, what was about to happen.
3. Record key decisions + one-line rationale under a **Decisions** section (add when first needed).
4. Commit this file with the work it describes (`git add HANDOFF.md`).
5. On recovery: read this file first, verify claims against `git log --oneline -5` and
   `ls`, then continue from Next steps. Do not re-do completed setup.

## Decisions

- 2026-07-18: Repo bootstrapped with graphify + MemPalace + git + this handoff before any project
  code, so tooling/memory survives crashes from minute one. Graph of CLAUDE.md built mainly to
  verify the pipeline end-to-end and enable incremental `--update` later.
