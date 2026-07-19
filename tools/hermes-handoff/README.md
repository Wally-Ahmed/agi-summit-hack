# hermes-handoff

**One front-door to your gated models.**

Frontier models are gated behind specific harnesses and their subscriptions: gpt-5.6-sol
only exists behind Codex CLI + ChatGPT, Gemini 3.1 Pro (High) behind Antigravity, Claude
Opus behind Claude Code + Max. You don't run three harnesses — you pay for one. And you
shouldn't have to buy API credits on top of a subscription you already have: the planner
brain can ride a first-party OAuth login (`hermes login` — Sign in with ChatGPT, or a Nous
Portal account) instead of a metered key.

`hermes-handoff` is a setup wizard + workflow: it detects which official harnesses are
installed and authed on your machine, you pick **one**, and it wires
[Hermes](https://github.com/NousResearch/hermes-agent) (Nous Research's agent) as a
planner that hands **any task — not just coding —** to that harness under its own
legitimate auth. Under the hood the pair runs on a local [Cotal](https://cotal.ai) space
(NATS transport, personas, channel ACLs); you never have to touch Cotal directly.

```
$ hermes-handoff init

  [claude] Claude Code     ✓ 2.1.214   ✓ auth     unlocks: Claude Opus 4.8 (Max)
  [codex]  Codex CLI       ✓ 0.144.6   ✓ auth     unlocks: gpt-5.6-sol (ChatGPT)
  [agy]    Antigravity CLI ✓ 1.1.4     ✓ auth     unlocks: Gemini 3.1 Pro High (Google)

Pick your harness [claude/codex/agy]: codex
  workspace    ~/hermes-handoff
  personas     planner.md, worker.md
  planner      hermes · anthropic/claude-sonnet-4.6
Ready.

$ hermes-handoff ask "collect every invoice PDF in ~/Documents into a summary sheet"
→ handed to Hermes — it will delegate to your Codex CLI worker
```

## Commands

| Command | What it does |
|---|---|
| `init` | wizard: detect harnesses, pick one, write personas, launch. `--harness codex --yes` for headless; `--no-launch` to configure only |
| `up` | (re)launch the mesh + planner + worker after a reboot or `stop` |
| `ask "…"` | hand Hermes a task (`--watch 60` tails the space live) |
| `status` | config + live roster |
| `stop` | stop both agents; `--down` also stops the mesh stack |

## Requirements

- Node ≥ 18, the Cotal CLI, and the Hermes connector (`cotal setup`)
- `hermes` binary: `uv tool install "hermes-agent>=0.16,<0.17"`
- An OpenRouter API key for the planner brain (`OPENROUTER_API_KEY`; model defaults to
  `anthropic/claude-sonnet-4.6`, override with `--model`)
- At least one harness, signed in on its own subscription: Claude Code, Codex CLI
  (needs `cotal-connector-codex`), or Antigravity CLI (needs `cotal-connector-agy`)

## Notes

- The wizard auto-applies the connector-hermes 0.12.0 ESM launcher fix (createRequire
  shim; original kept as `launch.js.orig`).
- Antigravity: one agy worker per machine (the connector merges an MCP entry into the
  global `~/.gemini/config/mcp_config.json`); the wizard detects and cleans a stale entry
  left by an unclean shutdown.
- Compliance by construction: every model is reached through its own official harness
  under your own login — no reverse-engineered APIs, no token sharing.
