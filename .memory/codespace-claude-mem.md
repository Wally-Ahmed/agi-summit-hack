---
name: codespace-claude-mem
description: claude-mem installed on the Codespace (v13.11.0) and the 7 pre-install sessions were backfilled via a custom transcript schema
metadata: 
  node_type: memory
  type: reference
  originSessionId: 8303b583-605f-4ccc-adbd-6955dbdbb55a
---

The GitHub Codespace (`glowing-acorn-q79w9x4vj4wx3xrgj`, Wally-Ahmed/agi-summit-hack) has
**claude-mem installed** as of 2026-07-20: plugin `claude-mem@thedotmack` **v13.11.0**
(marketplace HEAD via `npx claude-mem install --ide claude-code`), worker on port 37700,
**Bun 1.3.14** installed as its runtime (`npm i -g bun`). The Mac runs the older 12.4.7 —
independent instances, separate `~/.claude-mem` DBs; the skew is harmless. The worker
summarizes via the Claude Agent SDK using the Codespace's Claude Code OAuth token.

**Backfill DONE (2026-07-20).** claude-mem has no native retroactive ingestion for Claude
Code transcripts (live-hook pipeline only; Stop-replay yields 0 observations; the
transcript watcher ships no claude-code schema). We backfilled anyway by **authoring a
custom `claude-code-backfill` schema** for the watcher (key insight: all 7 pre-install
sessions were MESH WORKERS — zero human prompts; cotal channel injections
(`promptSource: system`) are the prompts; `message.content.0.*` paths map
tool_use/tool_result). The watcher only ingests when run **in-process by the worker**
(config at the default `~/.claude-mem/transcript-watch.json`; `ingestObservation` needs
worker context — the standalone `transcript watch` CLI silently no-ops observations).
Summaries were triggered manually per session via
`POST /api/sessions/summarize {contentSessionId, last_assistant_message}` (old transcripts
have no session_end).

Result: **7 sessions → 14 observations + 7 summaries + 37 prompts**, correctly attributed
to projects `agi-summit-hack` and `hh-e2e` (mesh handoff proofs, benchmark tasks, failover
runs, planner-debug session). The watcher config/state and `~/backfill-stage/` were
**removed afterward** — live sessions are captured only by native hooks; a re-run would
need the schema re-created (it's in this note's git history / HANDOFF). The 11 benchmark
`/tmp` scratch transcripts were deliberately excluded (noise). Pre-backfill backup:
`~/codespace-claudemem-backup-20260720-backfill.tgz` on the Codespace AND
`~/Desktop/codespace-claudemem-backup-20260720-backfill.tgz` on the Mac.
See [[standing-handoff]].
