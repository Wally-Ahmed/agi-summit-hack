#!/usr/bin/env bash
# Sync the Codespace's MemPalace store (~/.mempalace) into backups/codespace-mempalace.
# Runs AUTOMATICALLY on the Codespace via the repo's Claude Code SessionEnd hook
# (.claude/settings.json, gated on $CODESPACES); manual runs remain fine. Headless
# `gh codespace ssh` sessions have stale git auth — commits then land locally and are
# flushed by the next run that has auth (interactive session).
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
  # Nothing new — but flush any earlier local commits stranded by stale auth.
  if [ -n "$(git log --oneline @{u}..HEAD 2>/dev/null)" ]; then
    git push -q origin main 2>/dev/null || true
  fi
  echo "palace unchanged — nothing to sync"
  exit 0
fi
git -c user.email=openbroker00@gmail.com -c user.name="Wally Ahmed" \
  commit -m "Backup: refresh Codespace MemPalace snapshot"
git push origin main \
  || echo "WARN: push failed (stale Codespace git auth) — commit is local; it will push from the next interactive session"
