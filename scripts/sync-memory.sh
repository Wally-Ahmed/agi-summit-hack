#!/usr/bin/env bash
# Sync Claude Code file memory between this repo (.memory/) and the machine-local
# project memory dir (~/.claude/projects/<slug>/memory/).
#
#   sync-memory.sh push     local memory -> repo/.memory   (run before commit; also run by hooks)
#   sync-memory.sh restore  repo/.memory -> local memory   (run once on a new machine)
#
# The slug is derived from the repo's absolute path the same way Claude Code does
# (every non-alphanumeric character becomes '-'), so this works on any machine
# regardless of where the repo is cloned.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SLUG="$(printf '%s' "$REPO_DIR" | sed 's/[^a-zA-Z0-9]/-/g')"
LOCAL_MEM="$HOME/.claude/projects/$SLUG/memory"
REPO_MEM="$REPO_DIR/.memory"

case "${1:-push}" in
  push)
    [ -d "$LOCAL_MEM" ] || { echo "no local memory at $LOCAL_MEM — nothing to push"; exit 0; }
    mkdir -p "$REPO_MEM"
    cp -R "$LOCAL_MEM/." "$REPO_MEM/"
    echo "pushed $LOCAL_MEM -> $REPO_MEM"
    ;;
  restore)
    [ -d "$REPO_MEM" ] || { echo "no repo memory at $REPO_MEM — nothing to restore"; exit 1; }
    mkdir -p "$LOCAL_MEM"
    cp -R "$REPO_MEM/." "$LOCAL_MEM/"
    echo "restored $REPO_MEM -> $LOCAL_MEM"
    ;;
  *)
    echo "usage: sync-memory.sh [push|restore]" >&2
    exit 2
    ;;
esac
