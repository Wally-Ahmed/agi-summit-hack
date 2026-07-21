#!/usr/bin/env bash
# Sync the Codespace's MemPalace store (~/.mempalace) into backups/codespace-mempalace.
# RUN ON THE CODESPACE, ideally from an interactive terminal (headless `gh codespace ssh`
# sessions have stale git auth — the commit still lands locally and pushes next time).
# Part of the milestone routine alongside scripts/sync-memory.sh (see HANDOFF.md).
set -eu
cd "$(dirname "${BASH_SOURCE[0]}")/.."
D=backups/codespace-mempalace
[ -d "$HOME/.mempalace/palace" ] || { echo "no ~/.mempalace/palace on this machine — nothing to sync"; exit 0; }
mkdir -p "$D"
rm -rf "$D/palace"
cp -a "$HOME/.mempalace/palace" "$D/palace"
cp -a "$HOME/.mempalace/hallways.json" "$D/hallways.json" 2>/dev/null || true
git add "$D"
if git diff --cached --quiet -- "$D"; then
  echo "palace unchanged — nothing to sync"
  exit 0
fi
git -c user.email=openbroker00@gmail.com -c user.name="Wally Ahmed" \
  commit -m "Backup: refresh Codespace MemPalace snapshot"
git push origin main \
  || echo "WARN: push failed (stale Codespace git auth) — commit is local; it will push from the next interactive session"
