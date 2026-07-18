# Server setup — agi-summit-hack

Move dev to any cloud machine while preserving the memory layers. The repo itself is the
transport: everything portable is committed; everything machine-local is rebuilt or restored
by `bootstrap.sh`.

## Quick start (Codespace or any Linux box with git + Node 18+)

```bash
git clone https://github.com/Wally-Ahmed/agi-summit-hack.git
cd agi-summit-hack
bash bootstrap.sh
claude   # then /login, and read HANDOFF.md first
```

On a GitHub Codespace the clone already exists — just `bash bootstrap.sh`.

## What travels how

| Layer | Transport | On-server action |
|---|---|---|
| git history | clone | — |
| graphify graph (`graphify-out/`) | committed | bootstrap re-pins interpreter path |
| MemPalace config (`mempalace.yaml`) | committed | bootstrap re-mines `.mempalace/` vector DB |
| File memory (`.memory/` mirror) | committed | bootstrap restores to `~/.claude/projects/<slug>/memory/` |
| claude-mem recent context | committed via `CLAUDE.local.md` | fresh DB on server (full ~1.5 GB history stays on the Mac) |
| Auto-memory hooks | `.claude/settings.json.proposed` | activate with `mv .claude/settings.json.proposed .claude/settings.json` |
| Claude Code + plugins auth | ❌ per-machine | `claude` → `/login`, then `/plugin` to reinstall mempalace MCP |

## Keeping memory in sync across machines

- Before committing on any machine: `bash scripts/sync-memory.sh push` (hooks do this
  automatically once activated), then commit `.memory/`.
- After pulling on any machine: `bash scripts/sync-memory.sh restore`.
- HANDOFF.md remains the one-read recovery file — keep it updated and committed.
