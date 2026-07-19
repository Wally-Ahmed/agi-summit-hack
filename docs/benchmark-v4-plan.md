# Benchmark v4 plan — reasoning, hallucination, failover, cost (Wally's directive, Jul 19)

Status at compact: DESIGNED, NOT YET BUILT. Build → validate vs refs → commit → run
hermetically on the three subscription arms (claude, codex-sub, agy) → publish as runs 8–10.

## Run 8 — failover & reclaim (live mesh, ready to run)

Mesh is UP (planner + worker3; verify `worker` joined — its spawn reported "status uncertain",
the usual slow-boot). Protocol:
1. `WORK=$(mktemp -d)`, copy `benchmark/tasks/t4-interp/*` (long enough to kill mid-flight).
2. `cotal send ask planner "TASK … in $WORK. Delegate to ONE builder. You are responsible for
   completion: monitor progress, and if the assigned builder goes offline or stops responding,
   re-delegate to a different builder. DONE-WHEN: cd $WORK && python3 test.py prints PASS."`
3. Poll `cotal endpoints` until a builder goes `working`; wait ~20s into its turn, then
   `cotal stop --name <that builder>` (kill the victim mid-task).
4. Keep polling test.py (cap 900s). Record: victim, kill time, whether planner re-delegated,
   recovery worker, total time. Honest either way — "no autonomous reclaim" is a finding that
   motivates the supervision-by-convention story.
Note: if the mesh died uncleanly, agy worker3 respawn fails on a stale `"cotal"` entry in
`~/.gemini/config/mcp_config.json` — delete that key and respawn (hit + fixed once already).

## t12-reasoning (constraint scheduling — pure reasoning, machine-checked)

PROMPT gives rules; agent writes `schedule.json` mapping tasks→machines. test.py validates
constraints (any valid assignment passes). Rules:
- machines A,B,C · task durations t1:3 t2:2 t3:4 t4:1 t5:2
- per-machine total ≤ 6 · machine C total ≤ 5
- t1 and t3 on different machines · t2 and t4 on the SAME machine · t5 NOT on A
Known-valid reference (validated by hand): A:[t1] B:[t2,t4,t5] C:[t3] → totals 3/5/4. ✓
test.py: load schedule.json, check all five rules, PASS/exit0.

## t13-hallucination (grounding probe — DOES_NOT_EXIST discipline)

Ship `lib/` with EXACTLY four real functions:
- `slugify(s)` → lowercase, spaces→"-"
- `parse_id(s)` → int of s with leading non-digits stripped (e.g. "x42"→42)
- `clamp(n, lo, hi)`
- `merge_tags(a, b)` → dedup, preserve first-seen order
`questions.json`: 8 questions asking for concrete outputs; **3 of them reference things that
do not exist** (e.g. `lib.validate_schema`, a `lib.RETRY_LIMIT` constant, a `max_len=` param
on slugify). PROMPT: "Write answers.json mapping question id → answer. If a question
references anything that does not exist in lib/, the answer is exactly the string
DOES_NOT_EXIST." test.py holds expected answers (real ones computed FROM lib at test time,
fakes must equal "DOES_NOT_EXIST"). Score = hallucination resistance: does the harness check
reality or confabulate plausible behavior for the three traps?

## Run 10 — cost per verified task (analysis, no new runs)

From existing data: OpenRouter arms have per-task token counts in RESULTS.md; fetch
opus-4.8 + gemini-3.1-pro pricing from /api/v1/models and compute $/PASS. Subscription arms:
flat-rate framing (marginal $ ≈ 0; quota is the real constraint). One table + read.

## Still on roadmap after these: routing policy · long-horizon decomposition.
