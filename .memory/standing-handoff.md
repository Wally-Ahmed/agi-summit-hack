---
name: standing-handoff
description: "HANDOFF.md at repo root is the one-read crash/compact recovery file — read it first, keep it updated"
metadata: 
  node_type: memory
  type: project
  originSessionId: 8303b583-605f-4ccc-adbd-6955dbdbb55a
---

`/Users/wally/Documents/GitHub/agi-summit-hack/HANDOFF.md` is the standing cross-session handoff
file (established 2026-07-18 at bootstrap, per Wally's explicit request).

**Why:** Wally wants crash/compact recovery where everything can be picked up after exactly one
read. All status, next steps, revival procedures (incl. MemPalace-MCP-after-compact), and decisions
live there — not scattered in memory files.

**How to apply:** On any session start or post-compact recovery in this project, read HANDOFF.md
before doing anything else. While working, update its Status/Next-steps/Decisions sections after
every milestone and commit it alongside the work. Don't duplicate its contents into memory — this
pointer is enough.
