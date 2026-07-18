# Google Antigravity CLI — operational brief (researched 2026-07-18)

**Headline: a headless CLI EXISTS — binary `agy` (Go, closed-source), shipped ~May 2026.**
gemini-cli was SUNSET for individual/free/Pro/Ultra accounts on 2026-06-18 and no longer serves
requests — `agy` is the only scriptable Google harness. Same agent harness as the Antigravity 2.0
desktop IDE (which we don't need).

## Install (Linux/Codespace)

```bash
curl -fsSL https://antigravity.google/cli/install.sh | bash
agy --version && agy update
```

## Headless invocation (benchmark-ready)

```bash
timeout --signal=TERM --kill-after=15 600 \
  script -qec 'agy -p "<task>" --dangerously-skip-permissions' /dev/null | tee agy_out.txt
```
- `-p/--print` = one-shot non-interactive; permission modes: request-review (default),
  proceed-in-sandbox, always-proceed, strict; `--dangerously-skip-permissions` = full autonomy.
- **`script -qec … /dev/null` pseudo-TTY wrapper is LOAD-BEARING**: known bug — under a non-TTY,
  `agy -p` exits 0 but drops the final response from stdout. Sanitize ANSI:
  `sed -r 's/\x1B\[[0-9;]*[A-Za-z]//g'`.
- `--output-format json` NOT in current builds ("flag provided but not defined") — parse text.
- Judge success by output content + artifacts, never exit code alone.

## Auth (needs Wally)

- Interactive: Google OAuth, SSH-aware (prints URL + one-time code — works from a Codespace).
  May need a keyring (gnome-keyring) on a bare box.
- Headless: API key env var — exact name UNCERTAIN (`ANTIGRAVITY_API_KEY` most-attested;
  possibly `GEMINI_API_KEY`). Verify with `agy --help` after install.
- Tiers: Free ~20 agent-requests/day (unusable for benchmarks), Pro $20, Ultra $100/mo, or
  purchasable credits.

## Models & reasoning

- `agy models` / `--model "<name>"`. Gemini 3.5 Flash (Low/Medium/High), Gemini 3.1 Pro
  (Low/High), **plus Claude Sonnet 4.6 (Thinking), Claude Opus 4.6 (Thinking), GPT-OSS 120B** —
  plan-gated. Reasoning level is baked into the model display-name (the parenthetical); no
  separate thinking-budget flag. "High" is the xhigh-equivalent.

## MCP

Shared CLI+IDE config at **`~/.gemini/config/mcp_config.json`** (yes, still `.gemini`),
auto-reloads; stdio (`command`/`args`/`env`) and remote (`serverUrl`/`headers`). Gotcha:
env-var substitution inside the JSON reportedly broken — hardcode values.

## Verify on-box after install

1. exact API-key env var (`agy --help`); 2. whether `--output-format json` landed;
3. `-p` + `--dangerously-skip-permissions` combo on current build; 4. keyring behavior for OAuth.

## Consequences for our plan

- The Cotal connector targets **`agy`** (shim pattern from `docs/codex-connector-plan.md`:
  MeshAgent + cotal MCP over local HTTP + per-turn `agy -p` with the pTTY wrapper).
- Gemini-on-all-harnesses benchmark: Gemini 3.x via OpenRouter for codex/claude-code arms;
  native Gemini 3.1 Pro (High) in the `agy` arm.
- Antigravity subagent tools = register openrouter-subagents + gpt-subagents-api in
  `mcp_config.json`.
