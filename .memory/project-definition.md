---
name: project-definition
description: The real hackathon project — multi-harness orchestrator around Cotal.ai (NOT a judging platform)
metadata: 
  node_type: memory
  type: project
  originSessionId: 8303b583-605f-4ccc-adbd-6955dbdbb55a
---

AGI Summit 2026 Hackathon build (Wally is a participant, not a judge). The project is a
**multi-harness orchestration system built around Cotal.ai**, NOT the "judging platform" from the
original prompt (that framing is dead).

Core: a main harness "Hermes" plans long-running tasks but hands execution to other *official*
harnesses (Claude Code, Gemini CLI, Codex CLI) each under its own legit auth — staying within fair
use while working around third-party-harness restrictions. Benchmark: Cotal coordination vs.
spinning up subagents via openrouter/gpt-subscription/kilo MCP. First deliverable: convert those MCP
servers to CLI versions (openrouter + gpt-subscription first). Targets the Cotal.ai $500 sponsor
prize; wants it to be both a submission and a real tool.

**Full detail lives in [[standing-handoff]] → HANDOFF.md at repo root.** Also in-flight:
migrating dev to a cloud server while preserving all memory layers. Read HANDOFF.md first.
