# HANDOFF — agi-summit-hack

> **Standing cross-session / compact-recovery file.** If you (Claude) are reading this after a
> crash, `/compact`, or fresh session: this is the single source of truth. Read it once, then act.
> Verify claims against `git log --oneline -5` and `cotal ps` before trusting them.

_Last updated: 2026-07-19 ~00:55 UTC — agy connector committed (live test pending); session paused_

## ⚠️ Read first — SESSION PAUSED CLEANLY (Jul 19 ~00:45 UTC), resume checklist below

**Wally paused work mid-stream. State is fully persisted. Resume order:**

1. **Antigravity connector — BUILT + COMMITTED; live test still PENDING.** (Close-out
   2026-07-19 ~00:55 UTC; artifacts persist on the Codespace.) DONE: source lives in
   `connectors/cotal-connector-agy/` (the stale `.tmp-cotal-connector-agy/` draft was git-rm'd
   — Codespace copy preferred, per prior note); **`--add-dir <workRoot>` IS folded into the
   agy turn command** (serve.js `agyCommand`), dist rebuilt after the patch, extension
   re-registered (`cotal ext list` → cotal-connector-agy@0.1.0 connector:agy, smoke-import
   OK); standalone repo `/workspaces/cotal-connector-agy` git-init'd, single commit `055e041`,
   no remote. Conversation-continuity design shipped: per-turn `--log-file` → capture
   `Created conversation <uuid>` from the agy log → later turns pass `--conversation <id>`;
   fail-loud if a resume turn CREATES a new conversation; `COTAL_AGY_STATELESS=1` env =
   rolling-digest fallback (persona + last 12 in/out entries per turn). v1 fail-loud limits:
   ONE agy worker per machine (merges a "cotal" `serverUrl` entry into the GLOBAL
   `~/.gemini/config/mcp_config.json`, throws if one exists, removes it on shutdown AND
   process-exit); `supportsModelVariant: false` (level baked into model display name);
   launchOptions/resume/transcript all throw. Default model "Gemini 3.1 Pro (High)" via
   COTAL_MODEL passthrough.
   REMAINING (was gated on the hermetic benchmark, still running at pause): the live test —
   mesh up → `cotal spawn worker3 --agent agy --detach` → verify in `cotal endpoints` →
   `cotal send dm worker3 "reply with: AGY WORKER OK"` (accept the reply on #general — CLI
   DMs aren't roster-resolvable) → confirm via `cotal console --plain` → `cotal stop --name
   worker3` → **verify the "cotal" entry is gone from mcp_config.json**; budget ~4 debug
   cycles. Empirically UNVERIFIED (first debug targets if the live test fails): (a) headless
   `agy -p … --conversation <id>` resume actually continues the conversation; (b) agy accepts
   a streamable-HTTP MCP `serverUrl` (vs SSE) for the cotal server.
2. **codex-sub benchmark arms — blocked on Wally's login (deliberate).** He REFUSED reusing
   the Mac OAuth token (rotation would log his Mac out) — rule in memory. The copied token was
   DELETED from Codespace + bench home. Resume: run `nohup codex login --device-auth
   > /tmp/codex-login.log` on the Codespace, give Wally the URL+code, then
   `bash benchmark/run.sh codex-sub t1-lru t2-bugfix t3-cli` + hard suite, snapshot to
   `hermetic-codexsub-{easy,hard}.jsonl`, add the subscription table to RESULTS.md (pull real
   model id from harness.log). Port-1455 login server and gh port-forward were killed at pause.
3. **Benchmarks are DONE and PUBLISHED otherwise** — see benchmark/RESULTS.md @ 2b52049
   (hermetic runs 1/2/4 + still-valid run 3; contamination appendix). Standing rules: hermetic
   mode stays ON; templates tripwire in run.sh; agy needs `--add-dir`; OpenRouter = Opus 4.8
   control + gemini arm only; codex primary = subscription.
4. **MemPalace MCP drops on every `/compact`** (silent, no data loss). If its tools are
   disconnected, ask Wally to run `/plugin`; until then use file memory + graphify.
5. **Active branch is `antigravity`** (local Mac + Codespace both on it). `main` is behind —
   it stops at benchmark run 1. Everything since lives on the branch. Codespace will
   idle-suspend; mesh restart is in docs/hermes-mesh-runbook.md (remember: export
   OPENROUTER_API_KEY + HERMES_MODEL before `cotal up --detach`).
6. **After the above:** merge `antigravity`→`main` decision, then hackathon submission
   packaging (demo: live mesh handoff + benchmark tables; the two connectors + the
   mesh-beats-MCP run-3 result + the hermetic-methodology story are the pitch).
7. Open question awaiting Wally: file the connector-hermes ESM-bug upstream via
   `cotal feedback`? (Outward-facing — needs his yes/no.)
8. History of the contamination incident + invalidated numbers: benchmark/RESULTS.md appendix.
   Contaminated originals quarantined at Codespace `/tmp/template-quarantine` (note: /tmp does
   NOT survive a Codespace rebuild; the appendix is the durable record).

## Project (one paragraph)

AGI Summit 2026 Hackathon (Wally = participant; Cotal.ai $500 sponsor prize target). Build =
**Cotal mesh using the EXISTING Hermes** (Nous Research `hermes-agent`, already a Cotal
connector) **as planner**, delegating to official harnesses under their own auth: Claude Code
(Max sub, Fable 5 xhigh), Codex CLI (via our own connector), Antigravity CLI. Plus benchmarks:
harness-vs-harness and mesh-vs-direct-subagents. NOT a judging platform; NOT a new harness named
Hermes. Subagent pool = openrouter-subagents CLI/MCP + gpt-subagents-api MCP (gpt-subscription
DROPPED; Wally owns gpt-api updates — hands off his repo).

## Infrastructure state (all VERIFIED tonight)

- **Codespace `glowing-acorn-q79w9x4vj4wx3xrgj`** (`gh codespace ssh -c …`). Claude Code 2.1.214
  logged in (different account than Mac) — `~/.claude/settings.json`: model `claude-fable-5`,
  `effortLevel: xhigh`, permissions `acceptEdits` + allow [Bash, Write, Edit, Read, Glob, Grep,
  WebFetch, **mcp__cotal**]. (Widening allow to the subagent MCP servers was classifier-denied;
  use per-invocation `--allowedTools` instead — see run-coord.sh.)
- **Mesh `main` LIVE**: nats+delivery+manager (`cotal up --detach` from repo root; manager env
  carries OPENROUTER_API_KEY + HERMES_MODEL=anthropic/claude-sonnet-4.6 — detached spawns
  inherit the MANAGER's env, not your shell). Agents: `planner` (hermes connector),
  `worker` (claude, builder). Personas in `.cotal/agents/`. Hands-free end-to-end handoff
  VERIFIED twice (incl. post-restart certification).
- **connector-hermes 0.12.0 is PATCHED locally**: 2-line createRequire shim prepended to
  `~/.config/cotal/extensions/node_modules/@cotal-ai/connector-hermes/dist/launch.js`
  (backup `launch.js.orig`; a reinstall/update will UNDO it). `hermes` bin on PATH via
  `uv tool install "hermes-agent>=0.16,<0.17"`.
- **cotal-connector-codex (OURS) built + installed + spawn-tested**: source in
  `connectors/cotal-connector-codex/` and standalone repo `/workspaces/cotal-connector-codex`;
  installed extension at `~/.config/cotal/extensions`. Spawn: `cotal spawn worker2 --agent codex
  --detach` (persona `.cotal/agents/worker2.md`, currently pins gpt-4o-mini). Codex MCP calls
  need `--dangerously-bypass-approvals-and-sandbox` (default policy auto-cancels them).
- **Codex CLI 0.144.6**: `~/.codex/config.toml` → provider `openrouter` (base_url
  https://openrouter.ai/api/v1, env_key OPENROUTER_API_KEY, **wire_api "responses"** — "chat"
  removed in 0.144), default model anthropic/claude-opus-4.8, model_reasoning_effort xhigh,
  openrouter-subagents registered as MCP.
- **Antigravity CLI `agy` 1.1.4 installed + SIGNED IN** (Wally's Google account). Models
  available: Gemini 3.5 Flash (L/M/H), Gemini 3.1 Pro (Low/**High**), Claude Sonnet 4.6 /
  Opus 4.6 (Thinking), GPT-OSS 120B. NO Opus 4.8, no real GPT — closest equivalents used.
  Headless verified: `script -qec 'agy -p "…" --model "…" --dangerously-skip-permissions
  --print-timeout 25m' /dev/null` (pTTY wrapper is LOAD-BEARING — non-TTY drops stdout).
  MCP config wired at `~/.gemini/config/mcp_config.json` (openrouter-subagents + gpt-api).
- **OpenRouter topped up** by Wally (was $0.47 — planner 402ed and was stopped; now healthy,
  live-verified). Hermes auxiliary warnings ("no provider… title generation") are cosmetic —
  isolated HERMES_HOME can't see the key for aux features; main turns fine.
- **Both server repos + gpt-api synced on Codespace**; Wally's gpt-api cli.ts pushed (`08a348d`).

## Benchmarks (all in `benchmark/RESULTS.md`, runner `benchmark/run.sh` + `run-coord.sh`)

- **Run 1 hermetic** (easy t1-t3, Opus 4.8 xhigh): Codex 3/3 44s vs Claude Code 3/3 79s.
- **Run 2 hermetic** (hard t4-t7): Codex 4/4 105s (~343k tok) vs Claude Code 4/4 234s.
  **Capability ties; honest latency gap ~2× (dev-env had inflated it to 5×).**
- **Run 3** (CORE QUESTION — coordination): **Cotal mesh 3/3 95s BEATS direct MCP subagents
  3/3 137s (~30%)**; mesh overhead ≈ a bare claude -p.
- **Run 4 hermetic** (matrix ×7): agy+Gemini 7/7 298s BEATS codex+Gemini 7/7 521s (native
  harness ~1.75× faster, equal quality); agy+Opus4.6 7/7 295s; agy+GPT-OSS 6/7 333s (t4 =
  the only real capability failure in the 43-task set).
- **Run 4 IN FLIGHT**: matrix ×7 tasks: agy+Gemini-3.1-Pro-High, codex+google/gemini-3.1-pro-
  preview (xhigh), agy+Opus-4.6-Thinking, agy+GPT-OSS-120B. Snapshots:
  `benchmark/results/{agy-gemini31pro,codex-gemini31pro,agy-opus46,agy-gptoss}.jsonl`.
- **Standing model rule (Wally, twice):** OpenRouter benchmark arms = Opus 4.8 ONLY — never
  Fable via OpenRouter. Fable 5 xhigh = Codespace Claude sessions. run.sh models are
  env-switchable (BENCH_CODEX_MODEL / BENCH_CLAUDE_MODEL / BENCH_AGY_MODEL).
- Benchmark fairness rules learned: cp -R (subdirs!), strip CLAUDE.local.md from workdirs,
  prompt BEFORE variadic --allowedTools, tests validated against references before use.
- **HERMETIC RULE (Wally, Jul 19): harness benchmarks run WITHOUT our dev-env memory layers.**
  Audit found the Codespace claude env had NO memory layers (no global CLAUDE.md/hooks/claude-mem;
  cotal plugin scoped to /workspaces/agi-summit-hack only) BUT two global MCP servers
  (openrouter-subagents, gpt-subagents-api) booted on every `claude -p`; codex + agy also had
  MCP registered. run.sh now has hermetic mode (default ON; BENCH_HERMETIC=0 disables): clean
  CLAUDE_CONFIG_DIR + --strict-mcp-config / clean CODEX_HOME minus mcp_servers / agy mcp_config
  stashed+emptied with EXIT-trap restore. Wally: re-run runs 1–2 AND the full run-4 matrix
  hermetically after the in-flight matrix finishes (never concurrently — 2-core box). Publish
  hermetic numbers; keep pre-hermetic ones as a dev-env-overhead footnote. Watch the conflict:
  the agy-connector agent merges a cotal entry into ~/.gemini/config/mcp_config.json for its
  live test — run.sh's agy hermetic arm empties that same file, so sequence connector test and
  agy re-runs, never overlap.

## Next steps

1. When `MATRIX-DONE`: (a) autopsy the agy failure workdirs (`/tmp/bench-agy-*`; agy+Gemini-3.1-
   Pro-High went 3/7 while codex+same-Gemini went 7/7 — verify real failures vs agy stdout bug
   before publishing), (b) let the gated agy-connector agent finish its short live test first,
   (c) `git pull` run.sh onto the Codespace, hermetic-re-run runs 1–2 (codex+claude, t1–t3 +
   t4–t7) then the full run-4 matrix (4 arms × 7 tasks, snapshot each arm's jsonl between
   arms), (d) write RESULTS.md runs 1/2/4 from hermetic numbers (pre-hermetic as footnote),
   commit, push.
2. Author `cotal-connector-agy` (Antigravity as a mesh worker) — reuse the codex connector shim
   pattern (`docs/codex-connector-plan.md` + `connectors/cotal-connector-codex/`), with the
   pTTY wrapper from `docs/antigravity-brief.md`.
3. Decide merge `antigravity` → `main`, then hackathon submission packaging (demo script:
   mesh handoff live + benchmark tables; the Codex connector + coordination win are the story).
4. Wally (optional, still pending): activate auto-memory hooks —
   `mv .claude/settings.json.proposed .claude/settings.json` (Mac and/or Codespace).

## Key docs (read before touching the related area)

`docs/cotal-wire-contract.md` (protocol truths: NATS not HTTP, no task lifecycle, supervision
by convention) · `docs/hermes-mesh-runbook.md` (mesh ops + all 6 spawn fixes) ·
`docs/codex-connector-plan.md` (connector contract + shim architecture) ·
`docs/antigravity-brief.md` (agy install/auth/flags/bugs) · `benchmark/RESULTS.md`.

## Memory layers

git (branch `antigravity`, remote `Wally-Ahmed/agi-summit-hack`, PRIVATE) · graphify-out/ ·
mempalace.yaml (+ per-machine palace) · `.memory/` mirror ↔ `~/.claude/projects/<slug>/memory/`
via `scripts/sync-memory.sh push|restore` · CLAUDE.local.md (claude-mem context rides in repo) ·
HANDOFF.md (this file — update + commit at every milestone).

## Decisions log (chronological)

- Bootstrap-first (graphify/MemPalace/git/HANDOFF before code).
- Project redefined: judging platform ✗ → Cotal multi-harness; later corrected: use EXISTING
  Hermes (Nous), not a new harness.
- Cloud migration to Codespace; repo = transport; private remote.
- gpt-subscription dropped from hackathon; pool = openrouter + gpt-api (Wally owns gpt-api).
- Benchmark models: Opus 4.8 on OpenRouter arms only; Fable for sessions; agy uses its native
  roster (no 4.8 offered).
- Planner brain = sonnet-4.6 via OpenRouter (no Nous model on OpenRouter supports tool calls).
- Auto-mode classifier boundaries respected: no persistent hook/permission widening without
  Wally; per-invocation grants preferred; externally-sourced installers need his explicit OK.
