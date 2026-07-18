# cotal-connector-codex — implementation plan (researched 2026-07-18)

_Source: on-Codespace inspection of @cotal-ai/{core,connector-core,connector-claude-code,
connector-opencode,connector-hermes}@0.12.0 + developers.openai.com/codex docs. Full detail in
session transcript; this is the build sheet._

## Connector contract (@cotal-ai/core/dist/connector.d.ts)

- `Connector = {kind:"connector", name, requires?: string[], buildLaunch(opts): LaunchSpec,
  supportsModelVariant?, supportsResume?, transcriptChannel?, listModels?}`;
  register via `registry.register(connector)` as import side effect.
- `LaunchOpts`: space/name/role, creds/id or userAuth, servers, subscribe/allowSubscribe/
  allowPublish/capabilities, configPath (persona file), model, variant, launchOptions,
  prompt, resume, transcript, mcpServers, workspaceRoot.
- `LaunchSpec = {command, args, env?, confirm?, control?: {path, token}}`.

## Key facts

- **connector-core** (`@cotal-ai/connector-core@0.12.0`, on npm) provides: `configFromEnv()`,
  `MeshAgent` (NATS, presence, inbox: `drainInbox`, events incoming/wake), `registerCotalTools
  (mcpServer, agent, config, source)` — the whole cotal_* tool surface on any MCP server,
  `startControlServer`, `formatInjection`, `launchEnv({providerKeys})`, `aclEnv`, `userAuthEnv`,
  `connectorLaunchOptions`, `controlEndpoint`, `ORIENTATION_BOOTSTRAP`.
- **Template = connector-opencode**: buildLaunch returns `{command: process.execPath,
  args: [dist/serve.js], env, control}` — a Node shim owns ONE MeshAgent and drives the harness.
  Bundle connector-core INTO dist; keep `@cotal-ai/core` as peerDependency + `--external`
  (ext add symlinks nested @cotal-ai/* to the CLI's copy).
- **ext discovery**: `cotal ext add <pkg>` installs into `~/.config/cotal/extensions/`,
  stage-imports main (registry.register must fire), caches `{provides:[{kind:"connector",
  name:"codex"}]}` in extensions.json; `cotal spawn --agent codex` resolves from that cache.
- **Codex CLI**: NOT yet installed on the Codespace; `@openai/codex@0.144.6` on npm.
  Non-interactive: `codex exec --json` (JSONL: `thread.started{thread_id}`, `turn.completed`),
  `codex exec resume <id>`, `--skip-git-repo-check`, `--dangerously-bypass-approvals-and-sandbox`
  for fully unattended, `CODEX_API_KEY` env (exec only), `-c key=value` config overrides,
  MCP config `~/.codex/config.toml` `[mcp_servers.<name>]` command/args/env or url;
  `codex mcp add <name> -- <cmd>`.

## Shim design (src/serve.js)

MeshAgent + cotal MCP tools served on streamable HTTP `127.0.0.1:<free port>`; logical session =
chain of `codex exec` / `codex exec resume <threadId>` turns, each passed
`-c mcp_servers.cotal.url="http://127.0.0.1:<port>/mcp"`, `--model $COTAL_MODEL`,
`-c model_reasoning_effort="$COTAL_VARIANT"`. Inbox messages queue during a turn; on exit,
`formatInjection(agent.drainInbox())` becomes the next turn. First turn = persona + orientation.
v1 fail-loud: no resume, no tool-sharing, no transcript mirror.

## Open risks

(1) codex install + auth needed (ChatGPT login or CODEX_API_KEY). (2) `-c mcp_servers.*.url`
override + unauthenticated localhost HTTP MCP acceptance unverified on 0.144.x — fallback:
per-agent CODEX_HOME with generated config.toml. (3) verify `loadAgentFile` export name in
@cotal-ai/core. (4) verify thread-id field name live. (5) mid-turn messages wait for turn end.
