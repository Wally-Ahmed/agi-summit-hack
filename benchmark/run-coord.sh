#!/usr/bin/env bash
# Coordination-mechanism benchmark: the SAME goal delivered two ways.
#   mesh — task anycast to the Hermes planner, which delegates to the Claude Code worker
#          over the Cotal mesh (plan -> handoff -> execute -> verify -> report).
#   mcp  — one Claude Code -p orchestrator that must NOT write code itself; it delegates
#          content-generation to an MCP subagent (ask_openrouter), writes the result, tests.
# Measures end-to-end wall time from dispatch to the task's test passing on disk.
# NOTE: this measures COORDINATION overhead, not model quality — worker models differ by
# design (mesh worker = Fable 5 xhigh on Max; mcp subagent = OpenRouter model below).
#   usage: run-coord.sh <mesh|mcp> [task...]
set -u
ARM="$1"; shift
BENCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASKS=("$@"); [ ${#TASKS[@]} -eq 0 ] && TASKS=(t1-lru t2-bugfix t3-cli)
RESULTS="$BENCH_DIR/results"; mkdir -p "$RESULTS"
OUT="$RESULTS/coord-${ARM}.jsonl"; : > "$OUT"
SUBAGENT_MODEL="${COORD_SUBAGENT_MODEL:-anthropic/claude-sonnet-4.6}"
POLL_LIMIT="${COORD_TIMEOUT:-900}"

for t in "${TASKS[@]}"; do
  WORK=$(mktemp -d "/tmp/coord-${ARM}-${t}-XXXX")
  cp -R "$BENCH_DIR/tasks/$t/"* "$WORK/"
  find "$WORK" -name CLAUDE.local.md -delete 2>/dev/null
  PROMPT=$(cat "$WORK/PROMPT.md")
  START=$(date +%s)
  case "$ARM" in
    mesh)
      cotal send ask planner "TASK: complete the following in the directory $WORK (all file paths in the task are relative to that directory). CONSTRAINT: delegate execution to your builder worker; do not execute yourself. DONE-WHEN: 'cd $WORK && python3 test.py' prints PASS. Report on #results when verified. TASK SPEC: $PROMPT" >/dev/null 2>&1
      # poll until the task's own test passes or timeout
      PASS=false
      while [ $(( $(date +%s) - START )) -lt "$POLL_LIMIT" ]; do
        if (cd "$WORK" && timeout 120 python3 test.py >/dev/null 2>&1); then PASS=true; break; fi
        sleep 10
      done
      ;;
    mcp)
      (cd "$WORK" && timeout "$POLL_LIMIT" claude -p \
        --allowedTools "mcp__openrouter-subagents__ask_openrouter" \
        "You are an orchestrator. You must NOT write the solution code yourself. Use the mcp__openrouter-subagents__ask_openrouter tool (model: $SUBAGENT_MODEL, reasoning effort xhigh) to have a subagent produce the required file contents for the task below, then write the subagent's output to the required file(s) in the current directory, run 'python3 test.py', and iterate with the subagent (send it the test failure) until the test passes. TASK SPEC: $PROMPT" \
        >"$WORK/harness.log" 2>&1)
      if (cd "$WORK" && timeout 120 python3 test.py >/dev/null 2>&1); then PASS=true; else PASS=false; fi
      ;;
    *) echo "unknown arm: $ARM" >&2; exit 2 ;;
  esac
  SECS=$(( $(date +%s) - START ))
  echo "{\"arm\":\"$ARM\",\"task\":\"$t\",\"seconds\":$SECS,\"pass\":$PASS,\"work\":\"$WORK\"}" | tee -a "$OUT"
done
