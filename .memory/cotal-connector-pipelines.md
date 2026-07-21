---
name: cotal-connector-pipelines
description: "Upstream Cotal connector pipeline taxonomy + why their codex connector died (pull-only, removed 5b3eb21e) vs our push-by-respawn PRs"
metadata: 
  node_type: memory
  type: project
  originSessionId: 8303b583-605f-4ccc-adbd-6955dbdbb55a
---

Investigated 2026-07-21 (two subagents; clone at /tmp/cotal-upstream-inv, npm tarballs /tmp/codex-npm-pkg).

**Upstream connectors are all PUSH for automatic traffic; the model never polls.** The queue exists but is connector-side (`MeshAgent.inbox`, max 200, agent.ts:126) — a push layer flushes it:
- **claude-code**: persistent TUI; two-path push — MCP notification `notifications/claude/channel` only *wakes* an idle session; text enters context as hook `additionalContext` on SessionStart/UserPromptSubmit (ack on injection; Stop must NOT drain). No mid-turn steering.
- **opencode**: persistent server+TUI; batch injected as a real turn via `POST /session/<id>/prompt_async`; ack on session.idle.
- **hermes**: persistent sidecar owns MeshAgent, pushes serially over a unix-socket bridge; gateway spins a fresh AIAgent per message (can interrupt/queue live turns).
- **pi**: in-process extension; TRUE mid-turn steering (`deliverAs:"steer"`, only connector with it).
- `transcriptChannel` (`tr-<name>`) = outbound observability mirror only (claude-code + opencode implement; hermes/pi omit). `cotal_inbox` tool = secondary pull lane for quiet/focus/pull-only traffic.

**Their codex story — never "impossible", but push looked blocked:** documented reasons = Codex sandboxes lifecycle hooks (can't reach control socket) + no `claude/channel` analog to wake an idle TUI. So they shipped npm `@cotal-ai/connector-codex` 0.1.0–0.1.4 as PULL-ONLY (model told to poll `cotal_inbox`); it failed empirically (example-04: headless `codex exec` connected MCP, never called a tool, "scuffed") and was removed from main as "non-working" (commit 5b3eb21e, archived on `archive/connector-codex`). README had promised "push support is coming soon". Two unmerged push branches exist: `feat/codex-host-mode` (codex hooks + `--dangerously-bypass-hook-trust`) and `feat/connector-codex-host` → **PR #97** (headless `codex app-server` JSON-RPC driver, turn/start + turn/steer "Codex exceeds Claude here", E2E-verified, reply-driven only) — **open, zero comments since 2026-06-23**. Expectation-setter for review latency on our [[project-definition]] PRs #254/#255.

**Why ours works where theirs died:** their frame = persistent session that must be woken (no wake channel on Codex → dead end). Our frame = no persistent session: push-by-respawn — shim owns MeshAgent + local streamable-HTTP MCP; pump drains inbox per batch and spawns `codex exec resume <threadId>` (threadId scraped from `thread.started` JSONL) / `agy -p --conversation <id>` under `script(1)` pTTY. The wake problem evaporates because the shim is the wake. Nobody upstream ever mentions exec-resume respawn (verified: no commit/doc/issue). Wally's hypothesis "they push directly into context, at least for claude" = confirmed (with the wake-vs-inject nuance); "they thought it impossible" = overstated; respawn-sidestep = our original contribution.
