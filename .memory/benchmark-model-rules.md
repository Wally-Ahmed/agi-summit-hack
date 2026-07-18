---
name: benchmark-model-rules
description: Benchmarks via OpenRouter use Opus 4.8 ONLY — never run Fable through OpenRouter; Fable 5 xhigh is for Codespace Claude sessions
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8303b583-605f-4ccc-adbd-6955dbdbb55a
---

Wally's standing rule (2026-07-18, stated twice): the cross-harness benchmarks that route through
**OpenRouter use `anthropic/claude-opus-4.8` only**. Do **NOT** benchmark Fable via OpenRouter
("dont do fable test via openrouter only opus"), even though `anthropic/claude-fable-5` exists
there. [[cloud-model-preference]] (Fable 5 @ xhigh) applies to the Codespace's own Claude Code
sessions — interactive and cotal-spawned workers — not to the benchmark arms.

**Why:** he wants the paid OpenRouter path exercised with Opus per his benchmark spec; Fable is
his daily-driver harness model on subscription.

**How to apply:** `benchmark/run.sh` defaults (BENCH_CODEX_MODEL/BENCH_CLAUDE_MODEL) stay on
Opus 4.8; only override for the Gemini/GPT matrix on the [[project-definition]] antigravity
branch, never to Fable-via-OpenRouter.
