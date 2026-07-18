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
