#!/usr/bin/env bash
# Benchmark one harness over the task suite. Same model, same effort (xhigh), per-task
# fresh workdir, pass/fail judged ONLY by the task's own test.py.
#   usage: run.sh <codex|claude> [task...]
# Codex: model+effort from ~/.codex/config.toml (anthropic/claude-opus-4.8, xhigh, OpenRouter).
# Claude: --model claude-opus-4-8, effortLevel xhigh from ~/.claude/settings.json.
set -u
HARNESS="$1"; shift
BENCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASKS=("$@"); [ ${#TASKS[@]} -eq 0 ] && TASKS=(t1-lru t2-bugfix t3-cli)
RESULTS="$BENCH_DIR/results"; mkdir -p "$RESULTS"
OUT="$RESULTS/${HARNESS}.jsonl"; : > "$OUT"
HARNESS_TIMEOUT="${BENCH_TIMEOUT:-900}"
TEST_TIMEOUT="${BENCH_TEST_TIMEOUT:-120}"
# Same model on both harnesses (Opus 4.8 default per benchmark spec; xhigh comes from
# ~/.codex/config.toml model_reasoning_effort and ~/.claude/settings.json effortLevel).
CODEX_MODEL="${BENCH_CODEX_MODEL:-anthropic/claude-opus-4.8}"
CLAUDE_MODEL="${BENCH_CLAUDE_MODEL:-claude-opus-4-8}"
# agy model names are display strings with the reasoning level baked in.
AGY_MODEL="${BENCH_AGY_MODEL:-Gemini 3.1 Pro (High)}"

for t in "${TASKS[@]}"; do
  WORK=$(mktemp -d "/tmp/bench-${HARNESS}-${t}-XXXX")
  cp -R "$BENCH_DIR/tasks/$t/"* "$WORK/" && rm -f "$WORK/CLAUDE.local.md" "$WORK/CLAUDE.md"
  find "$WORK" -name CLAUDE.local.md -delete 2>/dev/null
  PROMPT=$(cat "$WORK/PROMPT.md")
  START=$(date +%s)
  case "$HARNESS" in
    codex)
      (cd "$WORK" && timeout "$HARNESS_TIMEOUT" codex exec --skip-git-repo-check \
        --model "$CODEX_MODEL" \
        --dangerously-bypass-approvals-and-sandbox "$PROMPT" >"$WORK/harness.log" 2>&1)
      ;;
    claude)
      (cd "$WORK" && timeout "$HARNESS_TIMEOUT" claude -p --model "$CLAUDE_MODEL" "$PROMPT" \
        >"$WORK/harness.log" 2>&1)
      ;;
    agy)
      # script(1) pseudo-TTY wrapper is load-bearing: agy -p under a non-TTY drops its
      # final response from stdout while exiting 0 (known bug).
      (cd "$WORK" && timeout --signal=TERM --kill-after=15 "$HARNESS_TIMEOUT" \
        script -qec "agy -p \"\$(cat PROMPT.md)\" --model \"$AGY_MODEL\" --dangerously-skip-permissions --print-timeout 25m" /dev/null \
        >"$WORK/harness.log" 2>&1)
      ;;
    *) echo "unknown harness: $HARNESS" >&2; exit 2 ;;
  esac
  RC=$?
  SECONDS_TAKEN=$(( $(date +%s) - START ))
  if (cd "$WORK" && timeout "$TEST_TIMEOUT" python3 test.py >/dev/null 2>&1); then PASS=true; else PASS=false; fi
  echo "{\"harness\":\"$HARNESS\",\"task\":\"$t\",\"seconds\":$SECONDS_TAKEN,\"pass\":$PASS,\"harness_rc\":$RC,\"work\":\"$WORK\"}" | tee -a "$OUT"
done
