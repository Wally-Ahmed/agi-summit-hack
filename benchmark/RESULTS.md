# Benchmark results

_All headline numbers below are from the **hermetic re-run** (2026-07-19 ~00:00 UTC, Codespace
`glowing-acorn`, 2-core Linux): every harness runs STOCK — clean `CLAUDE_CONFIG_DIR` +
`--strict-mcp-config`, clean `CODEX_HOME` without MCP servers, agy with its global MCP config
stashed and `--add-dir "$PWD"` so files land in the workdir. Templates verified clean against
git by the run.sh tripwire. Sequential arms, per-task fresh workdirs, pass judged only by each
task's own `test.py` (tests validated against reference solutions). All reasoning at
xhigh/harness-maximum. Earlier same-day numbers (dev-env, and a template-contamination
incident) are preserved in the appendix — they are footnotes, not findings._

## Run 4 — cross-harness matrix (hermetic): native vs foreign harness, 3-model shootout

| Task | agy · Gemini 3.1 Pro (High) | codex · Gemini 3.1 Pro (xhigh, OpenRouter) | agy · Claude Opus 4.6 (Thinking) | agy · GPT-OSS 120B (Medium) |
|---|---|---|---|---|
| t1-lru | ✅ 24s | ✅ 14s · 13,416 tok | ✅ 25s | ✅ 39s |
| t2-bugfix | ✅ 34s | ✅ 52s · 37,101 tok | ✅ 25s | ✅ 16s |
| t3-cli | ✅ 32s | ✅ 28s · 17,483 tok | ✅ 23s | ✅ 18s |
| t4-interp | ✅ 88s | ✅ 76s · 35,054 tok | ✅ 87s | ❌ 151s |
| t5-taskq | ✅ 48s | ✅ 121s · 106,502 tok | ✅ 63s | ✅ 70s |
| t6-diff | ✅ 48s | ✅ 149s · 86,003 tok | ✅ 43s | ✅ 21s |
| t7-ratelimit | ✅ 24s | ✅ 81s · 37,237 tok | ✅ 29s | ✅ 18s |
| **Total** | **7/7 · 298s** | **7/7 · 521s · ~333k tok** | **7/7 · 295s** | **6/7 · 333s** |

### Read (run 4)

- **Gemini on its NATIVE harness beats Gemini on a foreign one: 298s vs 521s (~1.75×), equal
  correctness (7/7 both).** The earlier "3/7 native" result was a harness artifact (see
  appendix), not model skill — once agy is grounded with `--add-dir`, Antigravity is the
  fastest way to run Gemini on this suite.
- **The Antigravity 3-model shootout is nearly a tie on wall-clock** (Gemini 298s, Opus 4.6
  Thinking 295s, GPT-OSS 333s): agy's own turn overhead dominates model differences at this
  task size. Correctness separates only at the bottom: GPT-OSS 120B dropped t4-interp (the
  mini-language interpreter — precedence/error-taxonomy heavy), the **only genuine capability
  failure in the entire 43-task hermetic set**.
- Codex+OpenRouter burns most of its Gemini tokens on its large fixed system prompt; per-task
  token spend tracks task difficulty on top of a ~13k floor.

## Run 2 — hard suite (hermetic): Claude Opus 4.8 on Codex vs Claude Code, xhigh both

| Task | Codex (Opus 4.8 via OpenRouter) | Claude Code (Opus 4.8 on Max) |
|---|---|---|
| t4-interp | ✅ 33s · 84,291 tok | ✅ 105s |
| t5-taskq | ✅ 37s · 142,452 tok | ✅ 43s |
| t6-diff | ✅ 21s · 58,979 tok | ✅ 55s |
| t7-ratelimit | ✅ 14s · 57,617 tok | ✅ 31s |
| **Total** | **4/4 · 105s · ~343k tok** | **4/4 · 234s** |

## Run 1 — easy suite (hermetic): same comparison

| Task | Codex (Opus 4.8 via OpenRouter) | Claude Code (Opus 4.8 on Max) |
|---|---|---|
| t1-lru | ✅ 15s · 56,181 tok | ✅ 22s |
| t2-bugfix | ✅ 14s · 55,757 tok | ✅ 28s |
| t3-cli | ✅ 15s · 56,144 tok | ✅ 29s |
| **Total** | **3/3 · 44s** | **3/3 · 79s** |

### Read (runs 1–2)

- **Correctness cannot separate the harnesses: 7/7 each, both suites, one-shot.** Opus 4.8 at
  xhigh clears adversarial tests (minimality proofs, boundary-exact semantics, planted-bug
  taxonomies) on either harness.
- **The honest latency gap is ~2× (44 vs 79s easy; 105 vs 234s hard) — NOT the ~5× we measured
  in the dev environment.** More than half of Claude Code's apparent hard-suite deficit
  (524s → 234s) was our own dev-env MCP servers booting per `claude -p` plus machine load, not
  the harness. Codex's lean exec loop is still consistently faster; it's just a 2× story, not 5×.
- For a mesh planner choosing a delegation target: latency and cost structure differentiate
  harnesses; capability (at this task size, same model) does not.

## Run 3 — coordination: Cotal mesh vs direct MCP subagents (unchanged, still valid)

_Ran 22:54–22:57 UTC Jul 18, before the contamination window; both arms shared the same
environment by design (it measures coordination topology, not harness overhead)._

| Task | Cotal mesh (plan→handoff→execute) | Direct MCP subagent (orchestrate→generate→write) |
|---|---|---|
| t1-lru | ✅ 32s | ✅ 46s |
| t2-bugfix | ✅ 31s | ✅ 51s |
| t3-cli | ✅ 32s | ✅ 40s |
| **Total** | **3/3 · 95s** | **3/3 · 137s** |

- **The mesh arm wins on wall-clock (~30% faster) at equal quality.** A worker *executing in
  place* beats generation-at-a-distance (subagent produces text → orchestrator transcribes →
  test → iterate). Mesh handoff cost ≈ noise: mesh end-to-end ≈ bare `claude -p` on the same
  tasks. Caveats: worker models differ by arm by design; n=3; single run; 10s poll granularity.

## What the hermetic re-run cost us to learn (methodology appendix)

1. **Dev-env overhead is real and asymmetric.** Same tasks, same models, dev-env vs hermetic:
   Claude Code easy 97s→79s, hard 524s→234s (globally-registered MCP servers boot on every
   `claude -p`, plus box contention); Codex easy 47s→44s, hard 106s→105s (barely affected).
   Benchmarking harnesses from inside a tooled-up dev environment quietly penalizes the
   harness that loads your tooling.
2. **The template-contamination incident.** In the first (pre-hermetic) matrix, agy — run
   without `--add-dir` — resolved relative paths against its own workspace and wrote solutions
   INTO `benchmark/tasks/` (t3 at 23:03, t5+t6 by 23:08, t2 at 23:23 UTC). Every arm launched
   after 23:03 copied solved templates into its workdirs. That invalidated the entire first
   matrix, including a spurious "codex+Gemini 7/7 vs agy 3/7" result. agy also wrote other
   files to `~/.gemini/antigravity-cli/scratch/` or `$HOME`, so its own arm was structurally
   depressed. Fixes: `--add-dir "$PWD"` on the agy arm, a run.sh tripwire that refuses to run
   if `benchmark/tasks` differs from git, and templates restored from git (contaminated copies
   quarantined at `/tmp/template-quarantine`).
3. **Invalidated pre-hermetic matrix numbers (do not cite):** agy+Gemini 3/7 · 627s,
   codex+Gemini 7/7 · 695s, agy+Opus4.6 5/7 · 453s, agy+GPT-OSS 4/7 · 375s. Also excluded: an
   aborted first hermetic attempt whose codex arms hit OpenRouter 402s mid-run.
4. **Repro:**

```bash
export OPENROUTER_API_KEY=…            # codex arms
bash benchmark/run.sh codex            # hermetic by default; BENCH_HERMETIC=0 to disable
bash benchmark/run.sh claude
bash benchmark/run.sh agy              # requires agy signed in
bash benchmark/run.sh codex-sub        # Codex on the ChatGPT subscription (native model)
# arm snapshots land in benchmark/results/hermetic-*.jsonl
```

_Pending: `codex-sub` arms (Codex on the ChatGPT subscription, native GPT model @ xhigh) — the
"each harness on its own subscription" comparison vs Claude Code on Max._
