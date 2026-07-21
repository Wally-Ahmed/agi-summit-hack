# Codespace MemPalace snapshot (backup)

Copy of the Codespace's `~/.mempalace/` store (wing: `agi_summit_hack` only — the
Codespace never held any other project). Mined 2026-07-18 from the repo's graphify
output at Codespace setup; it was never updated by later sessions, so the post-Jul-18
work is documented in claude-mem / HANDOFF.md instead, not here.

Contents: `hallways.json` (entity co-occurrence graph) + `palace/` (Chroma vector DB,
binary). Runtime `locks/` excluded.

Restore on a fresh Codespace: `mkdir -p ~/.mempalace && cp -a hallways.json palace ~/.mempalace/`
(or just re-mine: `mempalace mine .` — the palace is regenerable from the repo).
