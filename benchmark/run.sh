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

for t in "${TASKS[@]}"; do
  WORK=$(mktemp -d "/tmp/bench-${HARNESS}-${t}-XXXX")
  cp "$BENCH_DIR/tasks/$t/"* "$WORK/" && rm -f "$WORK/CLAUDE.local.md" "$WORK/CLAUDE.md"
  PROMPT=$(cat "$WORK/PROMPT.md")
  START=$(date +%s)
  case "$HARNESS" in
    codex)
      (cd "$WORK" && timeout 900 codex exec --skip-git-repo-check \
        --dangerously-bypass-approvals-and-sandbox "$PROMPT" >"$WORK/harness.log" 2>&1)
      ;;
    claude)
      (cd "$WORK" && timeout 900 claude -p --model claude-opus-4-8 "$PROMPT" \
        >"$WORK/harness.log" 2>&1)
      ;;
    *) echo "unknown harness: $HARNESS" >&2; exit 2 ;;
  esac
  RC=$?
  SECONDS_TAKEN=$(( $(date +%s) - START ))
  if (cd "$WORK" && timeout 60 python3 test.py >/dev/null 2>&1); then PASS=true; else PASS=false; fi
  echo "{\"harness\":\"$HARNESS\",\"task\":\"$t\",\"seconds\":$SECONDS_TAKEN,\"pass\":$PASS,\"harness_rc\":$RC,\"work\":\"$WORK\"}" | tee -a "$OUT"
done
