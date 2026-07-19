---
name: project-definition
description: The real hackathon project — Cotal mesh with EXISTING Hermes (Nous Research) as planner (NOT a judging platform, NOT a new harness)
metadata:
  type: project
  originSessionId: 8303b583-605f-4ccc-adbd-6955dbdbb55a
---

AGI Summit 2026 Hackathon build (Wally is a participant, not a judge). The project: a
**multi-harness orchestration mesh built on Cotal.ai**, using the **EXISTING Hermes** — Nous
Research's `hermes-agent`, already shipped as a Cotal connector (`cotal spawn --agent hermes`) —
as the main planner. Two dead framings to never revive: (1) the "judging platform"; (2) building
a NEW harness named Hermes (corrected by Wally 2026-07-18 ~17:15: "instead of making a new
harness i want to use the existing hermes").

Core: Hermes plans long-running tasks and hands execution to other *official* harness connectors
(Claude Code exemplar exists; Gemini CLI / Codex CLI candidates), each under its own legit auth —
fair-use compliant. Benchmark: Cotal-mesh coordination vs. direct subagents. **Subagent pool
(scope decision 2026-07-18): openrouter-subagents CLI + gpt-subagents-api MCP only —
gpt-subagents-subscription is DROPPED from the hackathon, and Wally personally owns all
gpt-subagents-api updates (hands off its repo/WIP).** Targets the Cotal.ai $500 sponsor prize.

Cotal facts that shape the design: NATS/JetStream transport (not HTTP); NO task lifecycle in the
protocol (see repo `docs/cotal-wire-contract.md`); supervision is channel-ACL convention.
Dev happens on the cloud Codespace ([[cloud-model-preference]]). **Full current state lives in
[[standing-handoff]] → HANDOFF.md at repo root — read that first.**

**PIVOT (Wally, 2026-07-19):** the mesh demo felt like a Cotal proof-of-concept, not a
standalone project — realistically you use ONE harness, not three. New product direction: an
installable **Hermes tool** with a setup wizard that picks ONE harness (Claude Code / Codex /
Antigravity / Claude Cowork) and wires a workflow where Hermes hands over ANY task (not just
coding). Value prop = **model gating**: frontier models are gated to specific harnesses +
subscriptions (gpt-5.6-sol→Codex, Gemini 3.1 Pro High→Antigravity, Opus→Claude Code); this is
the legitimate front-door around it. Cowork has NO headless API — only `claude://cowork/new`
deep links with a mandatory human-confirm dialog → attended tier only.
