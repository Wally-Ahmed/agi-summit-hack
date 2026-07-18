# Mesh runbook — existing Hermes (planner) + Claude Code / Codex (workers)

_Researched 2026-07-18 from Cotal-Ai/Cotal@main (`docs/connect-hermes.md`, `docs/connect-claude.md`,
`docs/agent-files.md`, `extensions/connector-hermes/`) and github.com/NousResearch/hermes-agent.
Companion to `cotal-wire-contract.md`._

## How the Hermes connector works (status: ALPHA)

- Hermes runs as a long-lived **gateway daemon**; the gateway spins up a **fresh agent per inbound
  message**. Cotal's connector is a launcher that owns the mesh endpoint and runs
  `hermes gateway run` as a child (Python plugin bridged over AF_UNIX sockets).
- Runs in an **isolated temp `HERMES_HOME`** — your `~/.hermes` (and any Nous Portal OAuth done
  interactively) is **invisible** to the meshed gateway. **Only env vars pass through.**
- Persona = written as Hermes' `SOUL.md` system-prompt file. Approvals off.
- Prereqs: macOS/Linux only; `uv` on PATH (uv auto-provisions `hermes-agent >=0.16,<0.17` — pinned
  ~2 minor lines behind upstream 0.18.2); spawn-only (`cotal spawn --agent hermes`, not in the
  `cotal setup` picker).
- **Auth: bring a raw provider key via env** + `HERMES_MODEL=provider:model`. Precedence:
  `--model` flag > agent-file `model:` > ambient `HERMES_MODEL`. We already have
  `OPENROUTER_API_KEY` on the Codespace → e.g. `HERMES_MODEL=openrouter:<model>`.
- Limits: no session resume; not in the containerized deploy image; no `launchOptions` surface.

## Claude Code worker connector

- `cotal setup` (one-time: installs the `cotal@cotal-mesh` claude plugin, seeds `default`
  persona) → `cotal up` (mesh + delivery daemon + manager) → `cotal spawn <name> --detach`.
- Manager launches real `claude` with `--strict-mcp-config` + only the cotal MCP server; env
  `COTAL_SPACE/NAME/ROLE/SERVERS`. Share extra MCP tools via `--share-tools` +
  `~/.config/cotal/config.json` (secrets as `${VAR}`).
- Delivery: SessionStart/UserPromptSubmit hooks drain+ack the inbox (works on any Claude build).
  Channel "nudge" wake needs claude ≥2.1.80 (we have 2.1.214). Directed msgs (DM/anycast/@mention)
  always nudge. Transcript mirrors to channel `tr-<name>`.

## Codex worker — DOES NOT EXIST YET

No Codex connector in the Cotal repo (exemplars: Claude Code, OpenCode, Hermes, pi). **We author
`cotal-connector-codex`** via the easy-path `Connector` interface from `@cotal-ai/core`
(`{kind:"connector", name, requires, buildLaunch(opts) => {command, args, env}}`, self-register,
`cotal ext add`). Model it on the Claude Code connector; Codex CLI runs under the user's ChatGPT
subscription auth. This is a deliverable of ours.

## Personas (`docs/agent-files.md` — there is no personas.md)

`.cotal/agents/<name>.md`: YAML frontmatter = identity/policy (`name`, `role` = anycast address,
`subscribe`, `allowPublish` (**omitted = deny**), `model`, `capabilities: [spawn]`), body =
persona appended to the system prompt (Hermes: becomes SOUL.md). Runtime minting:
`cotal_persona(name, prompt)` + `cotal_spawn(name, agent: "claude")` — capabilities/ACLs cannot
be self-granted over the wire. Personas are "short contracts, not titles."

## Runbook: stand up the mesh (on the Codespace)

1. Prereqs: `claude` CLI ✓ (2.1.214), `uv` ✓ (bootstrap installs it), Node ✓, `OPENROUTER_API_KEY` ✓.
2. `npm install -g cotal-ai` → `cotal setup` → `cotal up`.
3. `.cotal/agents/planner.md` — `name: planner, role: planner, capabilities: [spawn],
   allowPublish: [general, tasks]`; body: "You plan and delegate. NEVER execute. Decompose the
   task, cotal_spawn / DM workers, track via their tr-* channels and replies."
4. `.cotal/agents/worker.md` — `name: worker, role: builder`, execution persona.
5. `export OPENROUTER_API_KEY=…; export HERMES_MODEL=openrouter:<model>`.
6. `cotal spawn --agent hermes planner` (foreground; uv provisions hermes-agent on first run).
7. `cotal spawn worker --detach` (Claude Code under the manager) — or let the planner mint
   workers itself (`cotal_spawn`).
8. Observe: `cotal watch`, worker `tr-worker` channel.

## Design flags to respect

- (a) **Planner state lives ON THE MESH** (channels/`tr-*`/replies), not in Hermes memory —
  fresh-agent-per-message + temp HERMES_HOME discards local memory.
- (b) Nous Portal OAuth unusable in the isolated profile — raw key env only.
- (c) hermes-agent pinned to 0.16.x by the connector (upstream is 0.18.2).
- (d) `cotal spawn --detach --agent hermes` unverified (alpha doc shows foreground) — test it.
- (e) Advanced channel-nudge needs Anthropic Team/Enterprise admin enablement; core hook-drain
  delivery does not.
