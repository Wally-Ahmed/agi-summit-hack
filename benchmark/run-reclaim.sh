#!/usr/bin/env bash
# Run 11 — failover, revisited on v0.4 (PR #258 adopted). Same kill protocol as Run 8
# (benchmark/run-failover.sh), but the task is dispatched through a real Cotal v0.4 work
# pool owned by our supervisor (benchmark/reclaim/supervisor.mjs): enqueue → lease to a
# builder → DM it the task → kill it mid-turn → broker redelivery (ack_wait) → owner
# re-leases to the next builder → commit + terminal fact when test.py passes.
# Requires: mesh up, at least TWO builders idle, node >= 20, cotal on PATH.
set -u
BENCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$BENCH_DIR/results"
LOG="$BENCH_DIR/results/reclaim.log"; : > "$LOG"
CAP="${BENCH_TIMEOUT:-900}"
say() { echo "[+$(( $(date +%s) - START0 ))s] $*" | tee -a "$LOG"; }
strip() { sed 's/\x1b\[[0-9;]*m//g'; }
START0=$(date +%s)

# Same template-integrity tripwire as run.sh / run-failover.sh.
if git -C "$BENCH_DIR/.." rev-parse >/dev/null 2>&1; then
  DIRTY=$(git -C "$BENCH_DIR/.." status --porcelain -- "$BENCH_DIR/tasks" | grep -v '__pycache__' || true)
  if [ -n "$DIRTY" ]; then
    echo "FATAL: benchmark/tasks differs from git — template contamination? Refusing to run." >&2
    echo "$DIRTY" >&2
    exit 3
  fi
fi

# Supervisor deps (published @cotal-ai/core 0.13.2 — the updated system under test).
if [ ! -d "$BENCH_DIR/reclaim/node_modules" ]; then
  say "installing supervisor deps"
  (cd "$BENCH_DIR/reclaim" && npm install --no-fund --no-audit >>"$LOG" 2>&1) || { say "npm install failed"; exit 4; }
fi

TASK="${BENCH_RECLAIM_TASK:-t4-interp}"
WORK=$(mktemp -d /tmp/bench-reclaim-XXXX)
cp -R "$BENCH_DIR/tasks/$TASK/"* "$WORK/"
rm -f "$WORK/CLAUDE.local.md" "$WORK/CLAUDE.md"
find "$WORK" -name CLAUDE.local.md -delete 2>/dev/null
say "workdir: $WORK"

# Wait until NO builder is busy (attempt-1 lesson: a fresh worker shows "working
# (orienting)" and would be mistaken for the assignee). $2=="builder" matches the
# NAME/ROLE field only (attempt-2 lesson: "builder" in the planner's activity text).
busy_builders() { cotal endpoints 2>/dev/null | strip | awk -F'[ /]' '$2=="builder" && /working/ {print $1}'; }
idle_builder_count() { cotal endpoints 2>/dev/null | strip | awk -F'[ /]' '$2=="builder" && /idle/ {c++} END {print c+0}'; }
for _ in $(seq 1 36); do
  BUSY=$(busy_builders)
  [ -z "$BUSY" ] && break
  say "waiting for busy builders to settle: $BUSY"
  sleep 5
done
if [ "$(idle_builder_count)" -lt 2 ]; then
  say "FATAL: need >=2 idle builders for a reassignment run"; cotal endpoints 2>&1 | strip | tee -a "$LOG"; exit 1
fi
say "pre-run roster:"; cotal endpoints 2>&1 | strip | tee -a "$LOG"

# Start the pool supervisor (owner). It enqueues, leases, DMs the first builder.
RECLAIM_WORK="$WORK" RECLAIM_CAP_S="$CAP" \
RECLAIM_NATS="${RECLAIM_NATS:-nats://127.0.0.1:4222}" \
RECLAIM_SPACE="${RECLAIM_SPACE:-reclaim}" \
${RECLAIM_CREDS:+RECLAIM_CREDS="$RECLAIM_CREDS"} \
  node "$BENCH_DIR/reclaim/supervisor.mjs" >>"$LOG" 2>&1 &
SUP=$!
say "supervisor started (pid $SUP)"

# Kill the assigned builder ~20s into its turn — identical to Run 8.
VICTIM=""
for _ in $(seq 1 60); do
  VICTIM=$(busy_builders | head -1)
  [ -n "$VICTIM" ] && break
  sleep 5
done
if [ -z "$VICTIM" ]; then say "no builder ever went working — abort"; kill "$SUP" 2>/dev/null; exit 1; fi
say "builder working: $VICTIM — letting it run 20s"
sleep 20
say "killing $VICTIM"
cotal stop --name "$VICTIM" 2>&1 | strip | tee -a "$LOG"
KILL_AT=$(( $(date +%s) - START0 ))
say "victim=$VICTIM killed — now the pool's ack_wait redelivery decides, not us"

# Log roster transitions while the supervisor drives redelivery → re-lease → completion.
LASTR=""
while kill -0 "$SUP" 2>/dev/null; do
  R=$(cotal endpoints 2>/dev/null | strip | awk -F'[ /]' '/agent/ {printf "%s:%s ", $1, ($0 ~ /working/ ? "working" : ($0 ~ /offline/ ? "offline" : "idle"))}')
  if [ "$R" != "$LASTR" ]; then say "roster: $R"; LASTR="$R"; fi
  sleep 10
done
wait "$SUP"; RC=$?
TOTAL=$(( $(date +%s) - START0 ))
say "RESULT supervisor_rc=$RC total=${TOTAL}s victim=$VICTIM kill_at=${KILL_AT}s work=$WORK"
say "post-run roster:"; cotal endpoints 2>&1 | strip | tee -a "$LOG"
exit "$RC"
