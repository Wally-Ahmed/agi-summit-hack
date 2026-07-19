#!/usr/bin/env bash
# Run 8 — failover & reclaim. Delegate one task (t4-interp) through the live mesh,
# kill the assigned builder ~20s into its turn, and observe whether the planner
# notices and re-delegates. Requires: mesh up, planner + at least TWO builders idle.
# Honest either way — "no autonomous reclaim" is itself a finding.
set -u
BENCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$BENCH_DIR/results"
LOG="$BENCH_DIR/results/failover.log"; : > "$LOG"
CAP="${BENCH_TIMEOUT:-900}"
say() { echo "[+$(( $(date +%s) - START0 ))s] $*" | tee -a "$LOG"; }
strip() { sed 's/\x1b\[[0-9;]*m//g'; }
START0=$(date +%s)

# Same template-integrity tripwire as run.sh.
if git -C "$BENCH_DIR/.." rev-parse >/dev/null 2>&1; then
  DIRTY=$(git -C "$BENCH_DIR/.." status --porcelain -- "$BENCH_DIR/tasks" | grep -v '__pycache__' || true)
  if [ -n "$DIRTY" ]; then
    echo "FATAL: benchmark/tasks differs from git — template contamination? Refusing to run." >&2
    echo "$DIRTY" >&2
    exit 3
  fi
fi

WORK=$(mktemp -d /tmp/bench-failover-XXXX)
cp -R "$BENCH_DIR/tasks/t4-interp/"* "$WORK/"
rm -f "$WORK/CLAUDE.local.md" "$WORK/CLAUDE.md"
find "$WORK" -name CLAUDE.local.md -delete 2>/dev/null
say "workdir: $WORK"
say "pre-run roster:"; cotal endpoints 2>&1 | strip | tee -a "$LOG"

cotal send ask planner "TASK: complete the assignment described in $WORK/PROMPT.md, working in the directory $WORK. Delegate it to exactly ONE builder. You are responsible for completion: monitor progress, and if the assigned builder goes offline or stops responding, re-delegate the task to a different builder. DONE-WHEN: cd $WORK && python3 test.py prints PASS." 2>&1 | strip | tee -a "$LOG"
say "task sent to planner"

# Wait for a builder to go working, then kill it ~20s into its turn.
VICTIM=""
for _ in $(seq 1 60); do
  VICTIM=$(cotal endpoints 2>/dev/null | strip | awk -F'[ /]' '/builder/ && /working/ {print $1; exit}')
  [ -n "$VICTIM" ] && break
  sleep 5
done
if [ -z "$VICTIM" ]; then say "no builder ever went working — abort"; exit 1; fi
say "builder working: $VICTIM — letting it run 20s"
sleep 20
say "killing $VICTIM"
cotal stop --name "$VICTIM" 2>&1 | strip | tee -a "$LOG"
KILL_AT=$(( $(date +%s) - START0 ))
say "victim=$VICTIM killed"

# Poll for completion; log roster transitions so re-delegation is visible in the record.
PASS=false; LASTR=""
while [ $(( $(date +%s) - START0 )) -lt "$CAP" ]; do
  R=$(cotal endpoints 2>/dev/null | strip | awk -F'[ /]' '/agent/ {printf "%s:%s ", $1, ($0 ~ /working/ ? "working" : "idle")}')
  if [ "$R" != "$LASTR" ]; then say "roster: $R"; LASTR="$R"; fi
  if (cd "$WORK" && timeout 60 python3 test.py >/dev/null 2>&1); then PASS=true; break; fi
  sleep 10
done
TOTAL=$(( $(date +%s) - START0 ))
say "RESULT pass=$PASS total=${TOTAL}s victim=$VICTIM kill_at=${KILL_AT}s work=$WORK"
say "post-run roster:"; cotal endpoints 2>&1 | strip | tee -a "$LOG"
