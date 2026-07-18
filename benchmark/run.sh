#!/usr/bin/env bash
# Benchmark one harness over the task suite. Same model, same effort (xhigh), per-task
# fresh workdir, pass/fail judged ONLY by the task's own test.py.
#   usage: run.sh <codex|claude|agy> [task...]
# Codex: model+effort from a hermetic copy of ~/.codex/config.toml (Opus 4.8, xhigh, OpenRouter).
# Claude: --model claude-opus-4-8, effortLevel xhigh from a hermetic CLAUDE_CONFIG_DIR.
# HERMETIC (default): harnesses run stock — dev-env MCP servers / plugins / memory layers
# are excluded per arm so no harness pays our environment's boot cost or sees its context.
set -u
HARNESS="$1"; shift
BENCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASKS=("$@"); [ ${#TASKS[@]} -eq 0 ] && TASKS=(t1-lru t2-bugfix t3-cli)
RESULTS="$BENCH_DIR/results"; mkdir -p "$RESULTS"
OUT="$RESULTS/${HARNESS}.jsonl"; : > "$OUT"
HARNESS_TIMEOUT="${BENCH_TIMEOUT:-900}"
TEST_TIMEOUT="${BENCH_TEST_TIMEOUT:-120}"

# Template integrity tripwire: refuse to run if benchmark/tasks differs from the committed
# state. A harness once wrote its solutions INTO the templates (agy resolving relative paths
# against its workspace instead of cwd, pre --add-dir), which silently poisoned every later
# run's workdirs with copied solutions. Abort loudly rather than benchmark a solved suite.
if git -C "$BENCH_DIR/.." rev-parse >/dev/null 2>&1; then
  DIRTY=$(git -C "$BENCH_DIR/.." status --porcelain -- "$BENCH_DIR/tasks" | grep -v '__pycache__' || true)
  if [ -n "$DIRTY" ]; then
    echo "FATAL: benchmark/tasks differs from git — template contamination? Refusing to run." >&2
    echo "$DIRTY" >&2
    exit 3
  fi
fi
# Same model on both harnesses (Opus 4.8 default per benchmark spec; xhigh comes from
# ~/.codex/config.toml model_reasoning_effort and the hermetic settings.json effortLevel).
CODEX_MODEL="${BENCH_CODEX_MODEL:-anthropic/claude-opus-4.8}"
CLAUDE_MODEL="${BENCH_CLAUDE_MODEL:-claude-opus-4-8}"
# agy model names are display strings with the reasoning level baked in.
AGY_MODEL="${BENCH_AGY_MODEL:-Gemini 3.1 Pro (High)}"

# Hermetic mode (default ON): each harness runs STOCK — none of the dev-env additions
# (global MCP servers, plugins, memory layers) that would add per-invocation startup
# latency or context. Disable with BENCH_HERMETIC=0 to measure the dev env itself.
HERMETIC="${BENCH_HERMETIC:-1}"
CLAUDE_ENV=(env)
CODEX_ENV=(env)
if [ "$HERMETIC" = "1" ]; then
  case "$HARNESS" in
    claude)
      # Clean config dir: credentials + minimal settings only. No ~/.claude.json MCP
      # servers, no plugins, no global CLAUDE.md, no memory.
      CCFG=/tmp/bench-claude-home
      mkdir -p "$CCFG"
      cp "$HOME/.claude/.credentials.json" "$CCFG/" 2>/dev/null || true
      cat > "$CCFG/settings.json" <<'EOF'
{
  "effortLevel": "xhigh",
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": ["Bash", "Write", "Edit", "Read", "Glob", "Grep"]
  }
}
EOF
      [ -f "$CCFG/.claude.json" ] || echo '{"hasCompletedOnboarding": true}' > "$CCFG/.claude.json"
      CLAUDE_ENV=(env CLAUDE_CONFIG_DIR="$CCFG")
      ;;
    codex)
      # Clean CODEX_HOME: config.toml minus all [mcp_servers.*] sections. Auth is via
      # env OPENROUTER_API_KEY (env_key in the provider block), so no auth.json needed.
      CXH=/tmp/bench-codex-home
      mkdir -p "$CXH"
      awk '/^\[mcp_servers/{skip=1;next} /^\[/{skip=0} !skip' "$HOME/.codex/config.toml" > "$CXH/config.toml"
      CODEX_ENV=(env CODEX_HOME="$CXH")
      ;;
    codex-sub)
      # Codex on Wally's ChatGPT subscription (native OpenAI model): clean home with the
      # OAuth auth.json and a minimal config — no provider override, no MCP. Model is
      # codex's own default unless BENCH_CODEX_SUB_MODEL is set; effort pinned xhigh.
      CXS=/tmp/bench-codex-sub-home
      mkdir -p "$CXS"
      cp "$HOME/.codex/auth.json" "$CXS/"
      printf 'model_reasoning_effort = "xhigh"\npreferred_auth_method = "chatgpt"\n' > "$CXS/config.toml"
      CODEX_ENV=(env CODEX_HOME="$CXS")
      ;;
    agy)
      # agy only reads the global ~/.gemini/config/mcp_config.json: stash it and leave
      # an empty server map for the duration of the run, restore on exit.
      AGY_MCP="$HOME/.gemini/config/mcp_config.json"
      if [ -f "$AGY_MCP" ] && [ ! -f "$AGY_MCP.bench-stash" ]; then
        cp "$AGY_MCP" "$AGY_MCP.bench-stash"
        echo '{"mcpServers":{}}' > "$AGY_MCP"
        trap 'mv "$AGY_MCP.bench-stash" "$AGY_MCP" 2>/dev/null' EXIT
      fi
      ;;
  esac
fi

for t in "${TASKS[@]}"; do
  WORK=$(mktemp -d "/tmp/bench-${HARNESS}-${t}-XXXX")
  cp -R "$BENCH_DIR/tasks/$t/"* "$WORK/" && rm -f "$WORK/CLAUDE.local.md" "$WORK/CLAUDE.md"
  find "$WORK" -name CLAUDE.local.md -delete 2>/dev/null
  PROMPT=$(cat "$WORK/PROMPT.md")
  START=$(date +%s)
  case "$HARNESS" in
    codex)
      (cd "$WORK" && timeout "$HARNESS_TIMEOUT" "${CODEX_ENV[@]}" codex exec --skip-git-repo-check \
        --model "$CODEX_MODEL" \
        --dangerously-bypass-approvals-and-sandbox "$PROMPT" >"$WORK/harness.log" 2>&1)
      ;;
    codex-sub)
      SUBARGS=(); [ -n "${BENCH_CODEX_SUB_MODEL:-}" ] && SUBARGS=(--model "$BENCH_CODEX_SUB_MODEL")
      (cd "$WORK" && timeout "$HARNESS_TIMEOUT" "${CODEX_ENV[@]}" codex exec --skip-git-repo-check \
        "${SUBARGS[@]}" --dangerously-bypass-approvals-and-sandbox "$PROMPT" >"$WORK/harness.log" 2>&1)
      ;;
    claude)
      (cd "$WORK" && timeout "$HARNESS_TIMEOUT" "${CLAUDE_ENV[@]}" claude -p --model "$CLAUDE_MODEL" \
        --strict-mcp-config "$PROMPT" >"$WORK/harness.log" 2>&1)
      ;;
    agy)
      # script(1) pseudo-TTY wrapper is load-bearing: agy -p under a non-TTY drops its
      # final response from stdout while exiting 0 (known bug).
      # --add-dir "$PWD" is load-bearing too: without the workdir in agy's workspace,
      # new files land in ~/.gemini/antigravity-cli/scratch/ or $HOME instead of the
      # cwd — the model "passes" in its own transcript while the workdir stays empty
      # (observed on 4 of 7 pre-hermetic failures; edit-existing-file tasks were fine).
      (cd "$WORK" && timeout --signal=TERM --kill-after=15 "$HARNESS_TIMEOUT" \
        script -qec "agy -p \"\$(cat PROMPT.md)\" --model \"$AGY_MODEL\" --add-dir \"\$PWD\" --dangerously-skip-permissions --print-timeout 25m" /dev/null \
        >"$WORK/harness.log" 2>&1)
      ;;
    *) echo "unknown harness: $HARNESS" >&2; exit 2 ;;
  esac
  RC=$?
  SECONDS_TAKEN=$(( $(date +%s) - START ))
  if (cd "$WORK" && timeout "$TEST_TIMEOUT" python3 test.py >/dev/null 2>&1); then PASS=true; else PASS=false; fi
  echo "{\"harness\":\"$HARNESS\",\"task\":\"$t\",\"seconds\":$SECONDS_TAKEN,\"pass\":$PASS,\"harness_rc\":$RC,\"work\":\"$WORK\"}" | tee -a "$OUT"
done
