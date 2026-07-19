# Cotal Mesh: Official AI Harnesses as Coordinated Workers

**AGI Summit 2026 Hackathon — Cotal.ai track**

One mesh, three frontier coding agents — **Claude Code, Codex CLI, and Google Antigravity —
each running under its owner's real subscription**, coordinated by a persistent Hermes planner
over Cotal's NATS mesh. Ask the mesh for something; the planner plans, picks a worker, hands
off, and the worker executes *in place* and reports back verified results.

No API keys scraped, no auth bypassed: every harness is the official CLI, launched exactly the
way its vendor ships it, authenticated the way its vendor intends (Claude Max, ChatGPT
subscription, Google account). The mesh adds what none of them have alone: cross-vendor
delegation with task verification.

## What we built

| Piece | What it is |
|---|---|
| `connectors/cotal-connector-codex/` | **Our Codex CLI mesh connector** — Node shim owning one MeshAgent; cotal tools served to Codex over local streamable-HTTP MCP; turn chain via `codex exec` / `exec resume <threadId>` |
| `connectors/cotal-connector-agy/` | **Our Antigravity CLI mesh connector** — pTTY-wrapped `agy -p` turn loop, `--conversation` resume discovered from state-dir inspection, global MCP-config merge/restore, `--add-dir` workspace grounding |
| `benchmark/` | 7-task validated suite (easy + adversarial), hermetic runner (`run.sh`) for four harness arms + coordination benchmark (`run-coord.sh`), results + full methodology in [`benchmark/RESULTS.md`](benchmark/RESULTS.md) |
| `.cotal/agents/` | Personas: Hermes planner (plans, delegates, never executes) + three builder workers |
| `docs/` | Wire-contract notes, mesh runbook, connector plans, Antigravity CLI brief |

## The findings (5 benchmark runs, all on the same validated suite)

1. **Coordination pays for itself:** the Cotal mesh (planner → handoff → worker executes
   in place) beat a direct MCP-subagent orchestrator by **~30% wall-clock at equal quality**.
   Mesh end-to-end ≈ a bare `claude -p` — the handoff is effectively free.
2. **Capability is saturated; latency differentiates.** Same model (Opus 4.8) on Codex vs
   Claude Code: identical 7/7, ~2× latency gap. Gemini 3.1 Pro native on Antigravity vs via
   Codex+OpenRouter: identical 7/7, **native harness ~1.75× faster**.
3. **The backend pair, not the harness, dominates end-to-end latency:** on native
   subscriptions (Codex+gpt-5.6-sol vs Claude Code+Opus 4.8) the earlier gap *inverts* —
   Claude Code wins ~1.4×. A mesh planner can exploit exactly this, per task.
4. **Methodology matters and we paid for the lesson twice:** dev-env MCP servers were quietly
   inflating one harness's numbers ~2×, and an ungrounded harness once wrote its answers into
   the benchmark *templates*. Both caught, both fixed (hermetic mode + integrity tripwire),
   both documented in the RESULTS appendix. 42/43 hermetic tasks passed; the single genuine
   failure was GPT-OSS 120B on the interpreter task.

## Quick demo

```bash
# on the mesh host (repo root)
export OPENROUTER_API_KEY=…            # planner brain (sonnet-4.6)
export HERMES_MODEL=anthropic/claude-sonnet-4.6
cotal up --detach                      # nats + delivery + manager

cotal spawn planner --agent hermes --detach   # persistent planner
cotal spawn worker  --agent claude --detach   # Claude Code on Max
cotal spawn worker2 --agent codex  --detach   # Codex CLI on ChatGPT sub (our connector)
cotal spawn worker3 --agent agy    --detach   # Antigravity CLI (our connector)

# hand the mesh a real task
cotal send ask planner "TASK: implement an LRU cache in /tmp/demo, DONE-WHEN: python3 test.py prints PASS. Delegate to a builder; do not execute yourself."

cotal console --plain                  # watch the handoff + worker report live
```

See [`DEMO.md`](DEMO.md) for the full walkthrough and [`docs/hermes-mesh-runbook.md`](docs/hermes-mesh-runbook.md)
for operational details (spawn fixes, env rules, restart procedure).

## Repro the benchmarks

```bash
bash benchmark/run.sh codex        # Opus 4.8 via OpenRouter (control arm)
bash benchmark/run.sh claude       # Opus 4.8 on Max
bash benchmark/run.sh codex-sub    # native model on the ChatGPT subscription
bash benchmark/run.sh agy          # Antigravity (BENCH_AGY_MODEL picks the model)
bash benchmark/run-coord.sh mesh   # coordination arm A
bash benchmark/run-coord.sh mcp    # coordination arm B
```

All arms run **hermetic** by default: stock harness configs, no dev-environment MCP servers or
memory layers, templates verified against git before every run.
