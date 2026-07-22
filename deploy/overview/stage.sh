#!/usr/bin/env bash
# Stage the overview page + walkthrough assets for the Fly static deploy.
set -eu
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
rm -rf "$HERE/public"
mkdir -p "$HERE/public"
cp "$ROOT/overview.html" "$HERE/public/index.html"
# Stamp the build tag (bottom-left corner) so cached copies are identifiable at a glance.
BUILD="$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo local) · $(date -u +%H:%MZ) · $(grep -c '{cap:' "$ROOT/overview.html") scenes"
perl -pi -e "s/build dev/build $BUILD/" "$HERE/public/index.html"
cp -R "$ROOT/walkthrough" "$HERE/public/walkthrough"
find "$HERE/public" -name CLAUDE.local.md -delete 2>/dev/null || true
git -C "$ROOT" archive --format=zip HEAD -o "$HERE/public/hermes-handoff-project.zip"
du -sh "$HERE/public"
echo "staged — deploy with: fly deploy --config $HERE/fly.toml"
