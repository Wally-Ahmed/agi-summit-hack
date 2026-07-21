# Benchmark results

## Run 9 — reasoning & grounding (suite v4): constraint satisfaction · hallucination resistance

_2026-07-19. Two new validated tasks isolating non-coding dimensions: **t12-reasoning**
(constraint scheduling — place 5 jobs on 3 machines under five interacting constraints; the
checker validates the constraints themselves, so ANY valid assignment passes, not one
canonical answer) and **t13-hallucination** (grounding probe — 8 concrete questions about a
small local library, 3 of which reference functions/constants/parameters that DO NOT exist;
the only correct answer for those is exactly `DOES_NOT_EXIST`). Hermetic; the three
subscription-native arms. Both tasks validated virgin-fail/ref-pass before use._

| Arm | t12-reasoning | t13-hallucination | Total |
|---|---|---|---|
| Claude Code · Opus 4.8 (Max) | ✅ 18s | ✅ 33s | **2/2 · 51s** |
| Codex · gpt-5.6-sol (ChatGPT) | ✅ 24s | ✅ 39s | **2/2 · 63s** |
| Antigravity · Gemini 3.1 Pro (High) | ✅ 28s | ✅ 21s | **2/2 · 49s** |

- **6/6, and zero hallucinations: every arm answered `DOES_NOT_EXIST` on all three traps**
  (verified in each workdir's answers.json). The mechanism matters: an agentic harness
  grounds itself — it reads or executes `lib/` instead of confabulating plausible behavior,
  turning a "knowledge" question into a lookup. Hallucination resistance is a *harness*
  property as much as a model property.
- First table Antigravity tops (49s): at this task size the three subscription stacks sit
  within ~30% of each other — consistent with runs 5/7. Worker choice remains about quota,
  gated-model access, latency, and cost, not capability.

## Run 8 — failover & reclaim (live mesh): kill the assigned worker mid-task

_2026-07-19. Protocol (`benchmark/run-failover.sh`): hand the planner one task it hasn't
seen with explicit responsibility language ("monitor progress; if the assigned builder goes
offline, re-delegate"), wait for the assigned builder to go `working`, kill it ~20s into
its turn, watch for 900s. Planner brain: gpt-5.6 via the ChatGPT-subscription OAuth
(hermes pooled credential) — note this differs from runs 3/6 (sonnet-4.6/OpenRouter)._

| Attempt | What happened | Lesson |
|---|---|---|
| 1 | Victim mis-picked — killed a builder still *orienting*; the real assignee finished ✅ 94s | Bystander loss doesn't disturb an in-flight task. Bonus finding: the planner **independently verified** the result before accepting — re-ran test.py itself and scanned for banned tokens. |
| 2 | Victim matcher hit the *planner* (its activity text contained "builder"); task still passed in 50s — the warm worker recreated the solution from conversation memory | Worker state persists across tasks; clean measurements need fresh conversations. Delegated work survives planner death. |
| 3 | **Clean run**: assigned worker killed at +100s → **planner never re-delegated; DNF at the 900s cap** | **No autonomous reclaim.** Session autopsy: zero messages reached the planner after the kill. |

### Read (run 8)

- **The mechanism, confirmed from the planner's own message store:** Cotal has no task
  lifecycle, so a worker dying produces **no event** — and Hermes is event-driven: no
  message, no turn. The persona instruction "monitor progress" cannot execute without a
  wake source. The planner sat in `waiting` for 13 minutes over a dead assignment.
- **Resilience must come from the convention layer:** machine-checkable DONE-WHEN plus an
  active poller (exactly what our runner does), planner heartbeat crons, or watchdog
  nudges. This is the sibling of run 6's serial-queue fragility: *the planner acts only
  when spoken to.*
- The verification behavior in attempts 1–2 is the flip side: when messages DO arrive, the
  planner supervises well — it re-ran tests itself before accepting a worker's "done".
- Caveats: n=1 clean trial; the respawned planner inherited prior state (seeded home) —
  including a fully-verified previous instance of the same protocol — and still did not
  reclaim; single-box mesh.

## Run 10 — cost per verified task (analysis over the runs 1–4 token records)

| Arm (metered, OpenRouter) | Tokens (7 tasks) | Est. cost | Est. $/PASS |
|---|---|---|---|
| Codex · Opus 4.8 (runs 1–2) | 511,421 | ~$3.58 | **~$0.51** |
| Codex · Gemini 3.1 Pro (run 4) | 332,796 | ~$1.00 | **~$0.14** |

| Arm (subscription) | Marginal $/PASS | Real constraint |
|---|---|---|
| Claude Code (Max) · Codex (ChatGPT) · Antigravity (Google) | ≈ $0 | quota windows / rate limits |

- Method: codex reports one blended "tokens used" figure, so cost assumes the 90/10
  input/output split typical of agentic loops (context re-sent per turn dominates input) at
  list prices (Opus 4.8 $5/$25 per M in/out; Gemini 3.1 Pro $2/$12). Bounds: the Opus arm is
  $2.56 all-input to $12.79 all-output; the Gemini arm $0.67–$3.99. Read these as
  order-of-magnitude, not invoices.
- **Same harness, same tasks: Gemini is ~3.6× cheaper per verified task than Opus**, and on
  its native harness it was also the faster arm (run 4). For metered work, the
  cheap-frontier arm wins on both axes.
- **Subscriptions invert the economics.** All three subscription arms cleared every suite,
  so their marginal cost per verified task is ≈ $0 against flat monthly fees — the planner's
  real scheduling constraint is quota, not dollars.
- **Orchestrator idle-burn is a first-class cost line:** overnight, a wedged planner (hermes
  `skill_manage` loop) drained ~$4 of OpenRouter credit while producing nothing. Metered
  brains punish unattended loops; idle-timeouts and supervision are cost controls, not just
  reliability features.

## Run 7 — capability dimensions (suite v3): agentic depth · knowledge precision · self-verification

_2026-07-19. Three new validated tasks, each isolating a capability rather than raw
correctness: **t8-agentic** (multi-file bug discovery, no location hint — must run tests,
read tracebacks, navigate), **t9-omniscience** (RFC 4648 Base32 from memory, stdlib codec
banned; stdlib used as the test oracle), **t10-selfcheck** (thin prompt; the test IS the
spec; naive guesses fail). Hermetic; the three subscription-native arms._

| Arm | t8-agentic | t9-omniscience | t10-selfcheck | Total |
|---|---|---|---|---|
| Claude Code · Opus 4.8 (Max) | ✅ 37s | ✅ 32s | ✅ 42s | **3/3 · 111s** |
| Codex · gpt-5.6-sol (ChatGPT) | ✅ 36s | ✅ 72s | ✅ 39s | **3/3 · 147s** |
| Antigravity · Gemini 3.1 Pro (High) | ✅ 61s | ✅ 49s | ✅ 51s | **3/3 · 161s** |

- **9/9 — capability is saturated on every dimension we could isolate**, not just code
  generation: exploration-driven debugging, spec recall without references, and
  treat-the-test-as-truth discipline all pass everywhere.
- Ordering is consistent with run 5: Claude Code fastest on every task; the RFC-recall task
  produced the widest spread (32s vs 72s) — deep-recall cost differs more than coding cost.
- Implication for the mesh: worker choice is about **latency, quota, and cost — not skill.**

## Run 6 — mesh throughput: parallel fan-out vs serial through one worker (live mesh)

_2026-07-19. Same planner (Hermes), same 3 easy tasks, two scheduling shapes. Makespan =
dispatch → every task's own test passing on disk. Runner: `benchmark/run-parallel.sh`._

| Arm | Result | Makespan | Per-task |
|---|---|---|---|
| Parallel — one task to each of worker/worker2/worker3 | **3/3** | **203s** | t1 36s · t3 46s · t2 203s |
| Sequential — all three through `worker` only | **1/3 · DNF** | 1504s (cap) | t1 27s ✓, then t2/t3 never dispatched |

- **The heterogeneous pool works:** fan-out completed everything, makespan bounded by the
  slowest worker (203s; the fastest finished in 36s).
- **The honest half:** the serial arm exposed a planner reliability gap — after completing
  task 1 it dropped the remaining queue (workdir autopsy: t2 untouched template, t3 empty).
  This is a coordination-failure finding, not a timing number; it motivates the planned
  failover/reclaim study and argues for DONE-WHEN-per-task rather than batched serial asks.
- Caveats: n=1 per arm; parallel t2 (203s) rode the slowest worker (codex worker2 pinned to
  a small model); easy suite only.


_All headline numbers below are from the **hermetic re-run** (2026-07-19 ~00:00 UTC, Codespace
`glowing-acorn`, 2-core Linux): every harness runs STOCK — clean `CLAUDE_CONFIG_DIR` +
`--strict-mcp-config`, clean `CODEX_HOME` without MCP servers, agy with its global MCP config
stashed and `--add-dir "$PWD"` so files land in the workdir. Templates verified clean against
git by the run.sh tripwire. Sequential arms, per-task fresh workdirs, pass judged only by each
task's own `test.py` (tests validated against reference solutions). All arms ran at
**xhigh** — the highest setting shared across harnesses when these studies ran (agy's
ceiling is baked into its model display names, e.g. "Gemini 3.1 Pro (High)"). Correction
(Jul 19): xhigh is NOT the true ceiling — both codex (backend enum ends at `max`) and
Claude Code (`--effort max`, session-only) go one tier higher; the runner now pins `max`
on both arms for future runs. Runs 1–10 are internally consistent (same xhigh everywhere)
but understate both harnesses' maximum. Earlier same-day numbers (dev-env, and a
template-contamination incident) are preserved in the appendix — footnotes, not findings._

## Runs 1–2 & 4 — one hermetic suite, six harness × model arms (combined)

_Originally published as three tables: runs 1–2 (Opus 4.8 on Codex vs Claude Code, easy/hard
split) and run 4 (native-vs-foreign harness + the Antigravity 3-model shootout). All six arms
ran the IDENTICAL hermetic suite — same t1–t7 templates, same per-task `test.py` judges, same
Codespace, xhigh everywhere — so they are one benchmark and are presented as one matrix.
Historical run numbers are kept as aliases; cross-references elsewhere (runs 5 and 10, the
narrated walkthrough) remain valid._

| Task | Codex · Opus 4.8 (OpenRouter) | Claude Code · Opus 4.8 (Max) | agy · Gemini 3.1 Pro (High) | Codex · Gemini 3.1 Pro (OpenRouter) | agy · Opus 4.6 (Thinking) | agy · GPT-OSS 120B (Medium) |
|---|---|---|---|---|---|---|
| t1-lru | ✅ 15s · 56,181 tok | ✅ 22s | ✅ 24s | ✅ 14s · 13,416 tok | ✅ 25s | ✅ 39s |
| t2-bugfix | ✅ 14s · 55,757 tok | ✅ 28s | ✅ 34s | ✅ 52s · 37,101 tok | ✅ 25s | ✅ 16s |
| t3-cli | ✅ 15s · 56,144 tok | ✅ 29s | ✅ 32s | ✅ 28s · 17,483 tok | ✅ 23s | ✅ 18s |
| t4-interp | ✅ 33s · 84,291 tok | ✅ 105s | ✅ 88s | ✅ 76s · 35,054 tok | ✅ 87s | ❌ 151s |
| t5-taskq | ✅ 37s · 142,452 tok | ✅ 43s | ✅ 48s | ✅ 121s · 106,502 tok | ✅ 63s | ✅ 70s |
| t6-diff | ✅ 21s · 58,979 tok | ✅ 55s | ✅ 48s | ✅ 149s · 86,003 tok | ✅ 43s | ✅ 21s |
| t7-ratelimit | ✅ 14s · 57,617 tok | ✅ 31s | ✅ 24s | ✅ 81s · 37,237 tok | ✅ 29s | ✅ 18s |
| **Total** | **7/7 · 149s · ~511k tok** | **7/7 · 313s** | **7/7 · 298s** | **7/7 · 521s · ~333k tok** | **7/7 · 295s** | **6/7 · 333s** |

### Read (runs 1–2 · harness overhead, same model)

- **Correctness cannot separate the harnesses: 7/7 each, one-shot.** Opus 4.8 at
  xhigh clears adversarial tests (minimality proofs, boundary-exact semantics, planted-bug
  taxonomies) on either harness.
- **The honest latency gap is ~2× (44 vs 79s easy; 105 vs 234s hard) — NOT the ~5× we measured
  in the dev environment.** More than half of Claude Code's apparent hard-suite deficit
  (524s → 234s) was our own dev-env MCP servers booting per `claude -p` plus machine load, not
  the harness. Codex's lean exec loop is still consistently faster; it's just a 2× story, not 5×.
- For a mesh planner choosing a delegation target: latency and cost structure differentiate
  harnesses; capability (at this task size, same model) does not.

### Read (run 4 · native vs foreign harness, 3-model shootout)

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

## Run 5 — each harness on its OWN subscription (hermetic): the real-world mesh question

_Codex on Wally's ChatGPT subscription (native default model **gpt-5.6-sol**, xhigh) vs Claude
Code on Max (Opus 4.8, xhigh). Different models by design — this measures the end-to-end
delegation targets a mesh planner actually chooses between, each harness under its own
flat-rate auth (no 402s, no per-token billing)._

| Suite | Codex (gpt-5.6-sol on ChatGPT sub) | Claude Code (Opus 4.8 on Max) |
|---|---|---|
| easy t1–t3 | 3/3 · 100s (43+30+27) | 3/3 · 79s (22+28+29) |
| hard t4–t7 | 4/4 · 344s (135+89+71+49) | 4/4 · 234s (105+43+55+31) |
| **Total** | **7/7 · 444s · ~95k tok** | **7/7 · 313s** |

### Read (run 5)

- **The latency story INVERTS on native subscriptions: Claude Code wins (~1.4×).** Codex's
  ~2× speed advantage in runs 1–2 came from the same model (Opus 4.8) answering faster via
  OpenRouter than gpt-5.6-sol thinks at xhigh on the ChatGPT backend. Harness overhead is
  real but second-order; **the backend+model pair dominates end-to-end latency.**
- Correctness stays saturated: 7/7 both. Every frontier subscription pairing clears the suite.
- Codex's token counter reports ~10–21k/task here vs ~56–142k via OpenRouter — the
  subscription wire accounts its fixed system prompt differently; don't compare token columns
  across providers.
- For the mesh: pick delegation targets by *backend latency and quota*, not harness brand —
  exactly the decision a Cotal planner can make per-task.

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

