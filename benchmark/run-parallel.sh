#!/usr/bin/env bash
# Run 6 — mesh throughput: the SAME 3 tasks delivered two ways through the SAME planner.
#   parallel   — planner delegates ONE task to EACH of three heterogeneous builders
#                (worker=claude, worker2=codex, worker3=agy) running concurrently.
#   sequential — planner routes all three tasks through ONE builder (worker), serially.
# Measures per-task completion time and total MAKESPAN (dispatch → every task's own
# test passing on disk). Both arms pay identical planner overhead; the difference is
# scheduling across the worker pool.
#   usage: run-parallel.sh <parallel|sequential>
set -u
ARM="$1"
BENCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS="$BENCH_DIR/results"; mkdir -p "$RESULTS"
OUT="$RESULTS/parallel-${ARM}.jsonl"; : > "$OUT"
LIMIT="${COORD_TIMEOUT:-1500}"
TASKS=(t1-lru t2-bugfix t3-cli)

# Template integrity tripwire (same rationale as run.sh).
if git -C "$BENCH_DIR/.." rev-parse >/dev/null 2>&1; then
  DIRTY=$(git -C "$BENCH_DIR/.." status --porcelain -- "$BENCH_DIR/tasks" | grep -v '__pycache__' || true)
  [ -n "$DIRTY" ] && { echo "FATAL: benchmark/tasks dirty vs git:" >&2; echo "$DIRTY" >&2; exit 3; }
fi

declare -A WORKDIR
for t in "${TASKS[@]}"; do
  W=$(mktemp -d "/tmp/par-${ARM}-${t}-XXXX")
  cp -R "$BENCH_DIR/tasks/$t/"* "$W/"
  find "$W" -name CLAUDE.local.md -delete 2>/dev/null
  WORKDIR[$t]="$W"
done

case "$ARM" in
  parallel)
    MSG="THREE INDEPENDENT TASKS to run CONCURRENTLY: delegate exactly ONE task to EACH of your three builders (worker, worker2, worker3) at the same time. Do not execute anything yourself. "
    ;;
  sequential)
    MSG="THREE INDEPENDENT TASKS: delegate ALL of them to the single builder named 'worker' ONLY, one after another (do not use worker2 or worker3). Do not execute anything yourself. "
    ;;
  *) echo "unknown arm: $ARM" >&2; exit 2 ;;
esac
for t in "${TASKS[@]}"; do
  W="${WORKDIR[$t]}"
  MSG+="TASK ${t}: complete the task in $W (spec in $W/PROMPT.md, all paths relative to $W). DONE-WHEN: 'cd $W && python3 test.py' prints PASS. "
done
MSG+="Report each on #general when its test passes."

START=$(date +%s)
cotal send ask planner "$MSG" >/dev/null 2>&1

while :; do
  NOW=$(( $(date +%s) - START )); ALL=true
  for t in "${TASKS[@]}"; do
    W="${WORKDIR[$t]}"
    [ -f "$W/.bench-pass" ] && continue
    if (cd "$W" && timeout 60 python3 test.py >/dev/null 2>&1); then
      echo "{\"arm\":\"$ARM\",\"task\":\"$t\",\"seconds\":$NOW,\"pass\":true,\"work\":\"$W\"}" | tee -a "$OUT"
      touch "$W/.bench-pass"
    else
      ALL=false
    fi
  done
  $ALL && break
  if [ "$NOW" -ge "$LIMIT" ]; then
    for t in "${TASKS[@]}"; do
      W="${WORKDIR[$t]}"
      [ -f "$W/.bench-pass" ] || echo "{\"arm\":\"$ARM\",\"task\":\"$t\",\"seconds\":$NOW,\"pass\":false,\"work\":\"$W\"}" | tee -a "$OUT"
    done
    break
  fi
  sleep 5
done
echo "{\"arm\":\"$ARM\",\"makespan\":$(( $(date +%s) - START ))}" | tee -a "$OUT"
