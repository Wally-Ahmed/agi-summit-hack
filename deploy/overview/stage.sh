#!/usr/bin/env bash
# Stage the overview page + walkthrough assets for the Fly static deploy.
set -eu
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."
rm -rf "$HERE/public"
mkdir -p "$HERE/public"
cp "$ROOT/overview.html" "$HERE/public/index.html"
cp -R "$ROOT/walkthrough" "$HERE/public/walkthrough"
find "$HERE/public" -name CLAUDE.local.md -delete 2>/dev/null || true
du -sh "$HERE/public"
echo "staged — deploy with: fly deploy --config $HERE/fly.toml"
