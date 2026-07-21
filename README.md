# Hermes Handoff — One Front-Door to Your Gated Models

**AGI Summit 2026 Hackathon — Cotal.ai track**
**Live interactive overview (narrated walkthrough): https://hermes-handoff-overview.fly.dev/**

Frontier models are gated behind specific harnesses and their subscriptions: gpt-5.6-sol
only exists behind Codex CLI + ChatGPT, Gemini 3.1 Pro (High) behind Google Antigravity,
Claude Opus behind Claude Code + Max. You pay for one of them — and you shouldn't have to
buy API credits on top of a subscription you already own.

`hermes-handoff` is a setup wizard and workflow: it detects which official harnesses are
installed and signed in on your machine, you pick **one**, and it wires
[Hermes](https://github.com/NousResearch/hermes-agent) (Nous Research's agent) as that
harness's front door. From then on you hand Hermes **any task — research, files, data,
code —** and it delegates to your harness under your own login. The planner brain itself
rides a first-party OAuth sign-in (Sign in with ChatGPT, or a Nous Portal account), so the
whole loop runs at **≈ $0 marginal cost**. A [Cotal](https://cotal.ai) space runs
invisibly underneath — and scales up to a full multi-harness mesh when you want one.

Compliance by construction: every model is reached through its own official CLI under the
operator's legitimate auth. No token scraping, no reverse-engineered APIs.

```bash
$ hermes-handoff init
  [claude] Claude Code     ✓ 2.1.215  ✓ auth   unlocks: Claude Opus 4.8 (Max)
  [codex]  Codex CLI       ✓ 0.144.6  ✓ auth   unlocks: gpt-5.6-sol (ChatGPT)
  [agy]    Antigravity CLI ✓ 1.1.4    ✓ auth   unlocks: Gemini 3.1 Pro High (Google)
Pick your harness [claude/codex/agy]: …

$ hermes-handoff ask "collect every invoice PDF in ~/Documents into a summary sheet"
→ handed to Hermes — it will delegate to your worker
```

**End-to-end verified** (2026-07-19): wizard → mesh + planner (brain on a ChatGPT-sub
OAuth credential) → Claude Code worker → deliverable on disk, exactly as specified.

## What we built

| Piece | What it is |
|---|---|
| `tools/hermes-handoff/` | **The product** — zero-dependency wizard CLI: `init` (detect harnesses + auth, pick one, wire Hermes), `up`, `ask`, `status`, `stop`. Planner brain via subscription OAuth or any provider key |
| `connectors/cotal-connector-codex/` | **Our Codex CLI mesh connector** — the autonomous-worker half Cotal doesn't ship (their npm 0.1.4 experiment is pull-only on connector-core 0.2.0). Push delegation via `codex exec` / `exec resume <threadId>`, cotal tools over local streamable-HTTP MCP |
| `connectors/cotal-connector-agy/` | **Our Antigravity mesh connector** — the first anywhere: pTTY-wrapped `agy -p` turns, `--conversation` resume, global MCP-config merge/restore, `--add-dir` grounding |
| **Two upstream PRs** | Both connectors ported to the Cotal monorepo's TypeScript standards and submitted: [Cotal-AI/Cotal#254](https://github.com/Cotal-AI/Cotal/pull/254) (codex) + [Cotal-AI/Cotal#255](https://github.com/Cotal-AI/Cotal/pull/255) (agy) — bodies in [`docs/cotal-pr-drafts.md`](docs/cotal-pr-drafts.md) |
| `benchmark/` | 12-task validated suite (coding, agentic, recall, reasoning, hallucination-resistance) + runners for harness, coordination, throughput, failover, and cost studies — **10 runs published as 8 studies** (runs 1–2 & 4 ran one identical suite and are presented as a single six-arm matrix) in [`benchmark/RESULTS.md`](benchmark/RESULTS.md) |
| `overview.html` | The interactive submission page — 3 tabs, clickable inspector, task simulation, 19-scene narrated walkthrough with per-slide explainers — deployed at the link above |

## The findings (10 hermetic runs, 8 studies)

1. **Capability is saturated everywhere — including honesty.** 57/58 hermetic tasks passed
   across every arm. The hallucination probe (3 questions about functions that don't
   exist) produced **zero confabulations**: agentic harnesses read the code before
   answering. Skill no longer differentiates these stacks.
2. **Harness-per-model beats many-models-in-one-loop.** Cotal's setup (each harness
   invoked for its own associated model) beat a single loop calling models over MCP by
   **~30% wall-clock at equal quality** — and the mesh handoff itself costs ≈ nothing.
3. **Where a model runs is what you feel.** Same model, two harnesses: ~2× latency gap.
   Gemini on its native Antigravity vs through a foreign harness: **~1.75× faster at
   equal correctness**. On real subscriptions the ordering *inverts* — the backend+model
   pair dominates, so the choice should be made per task.
4. **Subscriptions invert the economics.** Metered, a verified task costs ~$0.14–0.51.
   On the subscriptions you already pay for: ≈ $0 marginal — quota, not dollars, is the
   constraint. (And a wedged orchestrator loop once burned $4 overnight producing
   nothing: automated spenders need supervision.)
5. **No autonomous reclaim — and we can prove why.** Kill the assigned worker mid-task
   and the planner never re-delegates: Cotal has no task lifecycle, so worker death emits
   no event, and an event-driven planner can't react to silence. Resilience must live in
   the conventions (machine-checkable DONE-WHEN + polling, heartbeats). The flip side,
   caught on tape: the planner *independently re-runs your tests* before accepting
   results.
6. **Methodology matters; we paid for the lesson.** Dev-env tooling quietly inflated one
   harness's numbers ~2×, and an ungrounded harness once wrote answers into the benchmark
   templates. Both caught, fixed (hermetic mode + integrity tripwire), and documented in
   the RESULTS appendix.

## Quick start (the product)

```bash
node tools/hermes-handoff/bin/hermes-handoff.js init   # wizard: pick your harness + brain
hermes-handoff ask "…any task…"                        # Hermes delegates, verifies, reports
hermes-handoff status · stop [--down]
```

## Scale-out mode (the full mesh)

```bash
cotal up --detach
cotal spawn planner --agent hermes --detach   # brain: hermes OAuth credential or OPENROUTER_API_KEY
cotal spawn worker  --agent claude --detach   # Claude Code on Max
cotal spawn worker2 --agent codex  --detach   # Codex CLI on ChatGPT (our connector)
cotal spawn worker3 --agent agy    --detach   # Antigravity (our connector)
cotal send ask planner "TASK: … DONE-WHEN: python3 test.py prints PASS. Delegate to a builder."
cotal console --plain                         # watch the handoff live
```

See [`DEMO.md`](DEMO.md) for the judge-facing script and
[`docs/hermes-mesh-runbook.md`](docs/hermes-mesh-runbook.md) for operational details.

## Repro the benchmarks

```bash
bash benchmark/run.sh codex      # Opus 4.8 via OpenRouter (control arm)
bash benchmark/run.sh claude     # Opus 4.8 on Max
bash benchmark/run.sh codex-sub  # native model on the ChatGPT subscription
bash benchmark/run.sh agy        # Antigravity (BENCH_AGY_MODEL picks the model)
bash benchmark/run-coord.sh mesh|mcp     # coordination arms
bash benchmark/run-parallel.sh           # throughput study
bash benchmark/run-failover.sh           # failover study (live mesh required)
```

All arms run **hermetic** by default: stock harness configs, no dev-environment MCP
servers or memory layers, templates verified against git before every run, every task
judged only by its own validated `test.py`. The runner pins each harness's true maximum
reasoning effort (`max`); published runs 1–10 ran at xhigh on every arm — consistent
across arms, relabelled honestly in RESULTS.
