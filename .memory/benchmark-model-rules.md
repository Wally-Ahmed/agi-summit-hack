---
name: benchmark-model-rules
description: Benchmarks via OpenRouter use Opus 4.8 ONLY — never Fable through OpenRouter; Fable 5 xhigh is for Codespace Claude sessions; benchmark arms must run HERMETIC (stock harness, no dev-env memory layers/MCP)
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

**Third rule (Wally, 2026-07-19):** codex benchmark arms should use **his ChatGPT subscription**
("i would rather use my subscription for consistency" — both harnesses flat-rate, no 402s).
run.sh harness `codex-sub`: hermetic home + his OAuth auth.json (copied Mac→Codespace), native
default model, xhigh. OpenRouter codex remains ONLY for cross-model arms (gemini) and the
same-model-Opus-4.8 control. Note: ChatGPT auth can only serve OpenAI models.

**Second rule (Wally, 2026-07-19):** harness-vs-harness benchmarks must run WITHOUT the memory
layers / additions of our dev environment — stock harnesses only. run.sh has hermetic mode
(default ON, BENCH_HERMETIC=0 to disable): claude gets a clean CLAUDE_CONFIG_DIR (credentials +
minimal settings, `--strict-mcp-config`; no global MCP servers, plugins, CLAUDE.md, memory);
codex gets a clean CODEX_HOME (config minus `[mcp_servers.*]`); agy gets its global
`~/.gemini/config/mcp_config.json` stashed/emptied for the run. Pre-hermetic runs (1, 2, 4)
carried ~2 global MCP servers of boot overhead per invocation on each arm — re-run or caveat.
