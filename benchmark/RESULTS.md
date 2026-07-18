# Benchmark run 3 — coordination: Cotal mesh vs direct MCP subagents (the core question)

_2026-07-18 night. Same goal delivered two ways, measured dispatch → task's own test passing
on disk. Mesh arm: anycast → Hermes planner (sonnet-4.6 brain) → delegates → Claude Code
worker (Fable 5 xhigh on Max) executes + verifies. MCP arm: one `claude -p` orchestrator
(Fable 5 xhigh) that may NOT write code itself — delegates content to `ask_openrouter`
(sonnet-4.6 xhigh), writes results, tests, iterates._

| Task | Cotal mesh (plan→handoff→execute) | Direct MCP subagent (orchestrate→generate→write) |
|---|---|---|
| t1-lru | ✅ 32s | ✅ 46s |
| t2-bugfix | ✅ 31s | ✅ 51s |
| t3-cli | ✅ 32s | ✅ 40s |
| **Total** | **3/3 · 95s** | **3/3 · 137s** |

## Read (run 3)

- **The mesh arm WON on wall-clock (~30% faster) at equal quality (3/3 both).** Cotal's
  coordination overhead (anycast + claim + reply correlation) is cheaper than the MCP
  orchestration round-trip (subagent produces text → orchestrator transcribes to disk →
  test → iterate). The worker *executing in place* beats generation-at-a-distance.
- Mesh handoff cost ≈ noise: mesh end-to-end (95s) ≈ bare `claude -p` on the same tasks in
  run 1 (97s). Planning+delegation is effectively free when pipelined.
- Caveats: worker models differ by arm (Fable-executes vs sonnet-generates+Fable-transcribes) —
  this benchmarks the COORDINATION TOPOLOGY, not model quality; n=3 easy tasks; single run.
  10s poll granularity on the mesh arm.

# Benchmark run 2 — suite v2 (hard tasks), Claude Opus 4.8: Codex vs Claude Code

_2026-07-18 evening, same setup as run 1, harder validated suite (`t4`–`t7`), xhigh both arms,
30-min/task cap. t5 numbers are the corrected re-run (a runner bug initially shipped t5 without
its `taskq/` package — both harnesses then simply WROTE the package from spec and passed; those
invalid results are excluded)._

| Task | Codex (Opus 4.8 via OpenRouter) | Claude Code (Opus 4.8 on Max) |
|---|---|---|
| t4-interp (build a mini-language interpreter) | ✅ 45s · 119,260 tok | ✅ 175s · n/a |
| t5-taskq (3 planted bugs + missing feature, multi-file) | ✅ 20s · 67,520 tok | ✅ 60s · n/a |
| t6-diff (provably minimal diff + perf gate) | ✅ 26s · 67,411 tok | ✅ 224s · n/a |
| t7-ratelimit (dual-constraint limiter, exact boundaries) | ✅ 15s · 65,055 tok | ✅ 65s · n/a |
| **Total** | **4/4 · 106s · ~319k tok** | **4/4 · 524s** |

## Read (run 2)

- **Correctness still cannot separate them: 8/8 combined across both suites, both harnesses.**
  Opus 4.8 at xhigh clears even adversarial tests (minimality proofs, boundary-exact semantics,
  planted-bug taxonomies) in one shot on either harness.
- **The wall-clock gap WIDENS with difficulty: ~2× on trivial tasks → ~5× on hard ones**
  (t6: 26s vs 224s). Claude Code's interactive-session machinery (hooks, richer tool loop,
  transcript) costs real time per turn; Codex's exec loop is lean. For a planner choosing a
  delegation target, this is the actionable finding: **latency, not capability, differentiates
  harnesses on same-model tasks.**
- Aside from the excluded run: with test.py as the only spec, both harnesses reconstructed the
  entire t5 package from scratch and passed — worth remembering when designing benchmarks
  (tests ARE a spec) and when arguing the fair-use framing (behavior is reproducible from
  contracts).

# Benchmark run 1 — Claude Opus 4.8: Codex harness vs Claude Code harness

_2026-07-18, Codespace `glowing-acorn` (2-core Linux). Same model (`claude-opus-4.8` /
`claude-opus-4-8`), same nominal reasoning (xhigh), same 3-task suite, fresh workdir per task,
pass judged only by each task's own `test.py`._

| Task | Codex (Opus 4.8 via OpenRouter) | Claude Code (Opus 4.8 on Max) |
|---|---|---|
| t1-lru (implement LRU cache) | ✅ 17s · 63,609 tok | ✅ 32s · n/a |
| t2-bugfix (interval merge) | ✅ 14s · 63,153 tok | ✅ 32s · n/a |
| t3-cli (wordfreq CLI) | ✅ 16s · 63,766 tok | ✅ 33s · n/a |
| **Total** | **3/3 · 47s** | **3/3 · 97s** |

## Read

- **Quality: tie (3/3 both).** The suite is too easy to separate the harnesses on correctness —
  it's a floor check. Separation would need harder, multi-file tasks.
- **Wall-clock: Codex ~2× faster** on these tasks. Likely dominated by harness overhead
  (session startup, hooks, turn loop), not model speed — `claude -p` boots a fuller session
  (settings, memory hooks, MCP).
- **Tokens:** Codex spends ~63k/task, the bulk being its large fixed system prompt re-sent per
  `exec` (values near-identical across tasks). Claude Code plain-text `-p` output doesn't report
  usage; billing is flat (Max) anyway.

## Caveats (honesty section)

1. **xhigh is adaptive on Opus 4.8** — both harnesses request high effort, the model chooses how
   much to think; on tasks this small it thinks briefly. Both arms share this behavior, so the
   comparison is fair, but this run does NOT stress deep reasoning.
2. Billing differs in kind: OpenRouter per-token (Codex arm) vs Max subscription flat (Claude arm).
3. n=3, one run, one machine; ±few seconds noise. Codex arm additionally passed
   `--dangerously-bypass-approvals-and-sandbox`; Claude arm used allow-list permissions.
4. Codex printed "Model metadata for anthropic/claude-opus-4.8 not found — fallback metadata";
   context-window/pricing hints may be off inside Codex, though task behavior was unaffected.

## Repro

```bash
export OPENROUTER_API_KEY=…   # codex arm
bash benchmark/run.sh codex
bash benchmark/run.sh claude
```
