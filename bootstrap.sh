#!/usr/bin/env bash
# One-shot server bootstrap for agi-summit-hack.
# Run from the repo root on a fresh cloud machine (Codespace / VPS):
#   bash bootstrap.sh
# Idempotent — safe to re-run.
set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"
FAIL=0
step() { printf '\n== %s ==\n' "$1"; }

step "uv (installer for graphify + mempalace)"
if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi
uv --version || FAIL=1

step "graphify (uv tool 'graphifyy')"
command -v graphify >/dev/null 2>&1 || uv tool install graphifyy -q
graphify --version 2>/dev/null || uv tool run graphifyy graphify --version || FAIL=1
# Re-pin the interpreter for this machine (skill reads this file)
uv tool run graphifyy python -c "import sys; open('graphify-out/.graphify_python','w').write(sys.executable)" 2>/dev/null
printf '%s' "$REPO_DIR" > graphify-out/.graphify_root

step "mempalace"
command -v mempalace >/dev/null 2>&1 || uv tool install mempalace -q
mempalace --version || FAIL=1

step "re-mine MemPalace vector DB (machine-local, rebuilt from repo)"
# Palace location varies by version: <=3.4 uses ./.mempalace, >=3.6 uses ~/.mempalace/palace
if [ ! -d .mempalace ] && [ ! -d "$HOME/.mempalace" ]; then
  yes | mempalace mine . || FAIL=1
else
  echo "palace exists — skipping (run 'yes | mempalace mine .' to refresh)"
fi

step "Claude Code CLI"
if ! command -v claude >/dev/null 2>&1; then
  if command -v npm >/dev/null 2>&1; then
    npm install -g @anthropic-ai/claude-code || FAIL=1
  else
    echo "npm not found — install Node 18+, then: npm install -g @anthropic-ai/claude-code"; FAIL=1
  fi
fi
claude --version 2>/dev/null || true

step "restore file memory (repo/.memory -> ~/.claude/projects/<slug>/memory)"
bash scripts/sync-memory.sh restore || FAIL=1

step "harness CLIs (openrouter-subagents + gpt-subagents-subscription)"
# The two MCP-servers-turned-CLIs the benchmark drives. Cloned as siblings of
# this repo, built, and npm-linked so their bins are on PATH.
CLI_BASE="$(dirname "$REPO_DIR")"
for repo in openrouter-subagents gpt-subagents-subscription; do
  dir="$CLI_BASE/$repo"
  if [ ! -d "$dir" ]; then
    git clone -q "https://github.com/Wally-Ahmed/$repo.git" "$dir" || { FAIL=1; continue; }
  else
    git -C "$dir" pull -q || true
  fi
  (cd "$dir" && npm install --no-fund --no-audit --silent && npm run build >/dev/null && npm link >/dev/null 2>&1) || FAIL=1
done

step "verify"
echo "git:        $(git log --oneline -1 2>/dev/null || echo MISSING)"
echo "graphify:   $( [ -f graphify-out/graph.json ] && echo graph.json ok || echo MISSING )"
echo "mempalace:  $( { [ -d .mempalace ] || [ -d "$HOME/.mempalace" ]; } && echo vector DB ok || echo 'MISSING (mine failed?)' )"
echo "memory:     $( [ -d "$HOME/.claude/projects/$(printf '%s' "$REPO_DIR" | sed 's/[^a-zA-Z0-9]/-/g')/memory" ] && echo restored || echo MISSING )"
echo "claude:     $(command -v claude || echo 'MISSING — needs npm i -g @anthropic-ai/claude-code')"
echo "openrouter: $(command -v openrouter-subagents || echo 'MISSING (npm link failed?)')"
echo "gpt-cli:    $(command -v gpt-subagents-subscription || echo 'MISSING (npm link failed?)')"

cat <<'EOF'

Manual steps that CANNOT be scripted (auth is per-machine):
  1. claude              # then /login  (Claude Code auth)
  2. In Claude Code: /plugin — reinstall mempalace plugin (MCP server) if needed
  3. Optional auto-memory hooks: mv .claude/settings.json.proposed .claude/settings.json
  4. Read HANDOFF.md first in any new session.

Note: claude-mem history (~1.5 GB in ~/.claude-mem on the Mac) does NOT travel; the
server starts a fresh claude-mem history. Recent context is in CLAUDE.local.md + HANDOFF.md.
EOF

exit $FAIL
