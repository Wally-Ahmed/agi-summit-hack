// cotal-connector-agy — the serve shim (LaunchSpec.command = node, args = [dist/serve.js]).
//
// Owns ONE MeshAgent for the lifetime of the agent and drives the Google Antigravity CLI
// (`agy`) as a chain of non-interactive turns:
//
//   turn 1:  agy -p <persona + orientation [+ initial prompt]>
//   turn N:  agy -p <formatInjection(drainInbox())> --conversation <conversationId>
//
// Every turn runs under a pseudo-TTY (`script -qec … /dev/null`) — LOAD-BEARING: under a
// non-TTY `agy -p` exits 0 but drops the final response from stdout. The conversation ID is
// captured from the per-turn agy log file ("Created conversation <uuid>"), and later turns
// resume it with `--conversation` (state lives in ~/.gemini/antigravity-cli/conversations/).
//
// agy has no per-invocation MCP flag, so at startup this shim MERGES a "cotal" entry
// ({"serverUrl": "http://127.0.0.1:<port>/mcp"}) into the GLOBAL
// ~/.gemini/config/mcp_config.json and REMOVES it (other entries untouched) on shutdown and
// on process exit. Consequence: ONE agy mesh worker per machine (v1) — fail loud if a
// "cotal" entry already exists. The local streamable-HTTP MCP server (this process) exposes
// the full cotal_* tool surface bound to the ONE MeshAgent, so mesh state (inbox acks,
// presence, joins) survives across turns. Peer messages that arrive mid-turn queue in the
// MeshAgent inbox and become the next turn.
import { spawn } from "node:child_process";
import { createServer as createNetServer } from "node:net";
import { createServer as createHttpServer } from "node:http";
import { once } from "node:events";
import { homedir, tmpdir } from "node:os";
import { join, dirname } from "node:path";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { loadAgentFile } from "@cotal-ai/core";
import {
  configFromEnv,
  hasIdentity,
  MeshAgent,
  registerCotalTools,
  startControlServer,
  formatInjection,
  ORIENTATION_BOOTSTRAP,
} from "@cotal-ai/connector-core";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const DEFAULT_MODEL = "Gemini 3.1 Pro (High)";
const PRINT_TIMEOUT = process.env.COTAL_AGY_PRINT_TIMEOUT ?? "25m";
// Hard kill a little after agy's own --print-timeout should have fired.
const TURN_TIMEOUT_MS = Number(process.env.COTAL_AGY_TURN_TIMEOUT_MS ?? 27 * 60 * 1000);
// Escape hatch: stateless turns with a rolling digest instead of --conversation resume.
const STATELESS = process.env.COTAL_AGY_STATELESS === "1";
const DIGEST_MAX_ENTRIES = 12;
const DIGEST_MAX_CHARS = 1500;
const MCP_CONFIG_PATH = join(homedir(), ".gemini", "config", "mcp_config.json");

const log = (msg) => process.stderr.write(`[cotal-agy] ${msg}\n`);
const shq = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`;
const stripAnsi = (s) =>
  String(s)
    .replace(/\x1B\][^\x07\x1B]*(?:\x07|\x1B\\)/g, "") // OSC
    .replace(/\x1B\[[0-9;?]*[A-Za-z]/g, "") // CSI
    .replace(/\x1B[@-Z\\-_]/g, "") // other escapes
    .replace(/\r/g, "");

async function freePort() {
  const srv = createNetServer();
  srv.listen(0, "127.0.0.1");
  await once(srv, "listening");
  const port = srv.address().port;
  await new Promise((r) => srv.close(() => r()));
  return port;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

// ---- global mcp_config.json merge / restore (agy auto-reads it per process launch)
let cotalEntryInstalled = false;

function installCotalMcpEntry(url) {
  let cfg = {};
  if (existsSync(MCP_CONFIG_PATH)) {
    try {
      cfg = JSON.parse(readFileSync(MCP_CONFIG_PATH, "utf8"));
    } catch (e) {
      throw new Error(
        `cotal-connector-agy: cannot parse ${MCP_CONFIG_PATH} (${e.message}) — refusing to overwrite it.`,
      );
    }
  }
  cfg.mcpServers ??= {};
  if (cfg.mcpServers.cotal)
    throw new Error(
      `cotal-connector-agy: a "cotal" entry already exists in ${MCP_CONFIG_PATH} — ` +
        `another agy mesh worker is running (v1 supports ONE agy worker per machine), ` +
        `or a previous run crashed without cleanup. Stop it / remove the entry and respawn.`,
    );
  cfg.mcpServers.cotal = { serverUrl: url };
  mkdirSync(dirname(MCP_CONFIG_PATH), { recursive: true });
  writeFileSync(MCP_CONFIG_PATH, JSON.stringify(cfg, null, 2) + "\n");
  cotalEntryInstalled = true;
  log(`installed "cotal" MCP entry (${url}) in ${MCP_CONFIG_PATH}`);
}

function removeCotalMcpEntry() {
  if (!cotalEntryInstalled) return;
  cotalEntryInstalled = false;
  try {
    const cfg = JSON.parse(readFileSync(MCP_CONFIG_PATH, "utf8"));
    if (cfg.mcpServers && "cotal" in cfg.mcpServers) {
      delete cfg.mcpServers.cotal;
      writeFileSync(MCP_CONFIG_PATH, JSON.stringify(cfg, null, 2) + "\n");
      log(`removed "cotal" MCP entry from ${MCP_CONFIG_PATH}`);
    }
  } catch (e) {
    log(`mcp_config cleanup FAILED (remove the "cotal" entry manually): ${e?.message ?? e}`);
  }
}

async function main() {
  if (!hasIdentity())
    throw new Error(
      "cotal-connector-agy serve: no COTAL_* identity in the environment — this shim is only launched by the cotal manager (not a managed session).",
    );

  const config = configFromEnv();
  config.connector = "agy";
  const workRoot = process.env.COTAL_AGY_HOME?.trim() || process.cwd();
  const initialPrompt = process.env.COTAL_AGY_PROMPT;
  const model = process.env.COTAL_MODEL?.trim() || DEFAULT_MODEL;

  // Persona body (markdown after the frontmatter) — configFromEnv reads the frontmatter
  // (name/role/channels), the body is ours to hand agy as its first turn.
  let persona;
  if (process.env.COTAL_AGENT_FILE) {
    try {
      persona = loadAgentFile(process.env.COTAL_AGENT_FILE).persona;
    } catch (e) {
      throw new Error(
        `cotal-connector-agy: cannot read agent file ${process.env.COTAL_AGENT_FILE}: ${e.message}`,
      );
    }
  }

  const agent = new MeshAgent(config);
  agent.on("error", (e) => log(`mesh error: ${e?.message ?? e}`));
  agent.start();

  // ---- cotal MCP over local streamable HTTP (stateless: fresh server per request, one shared agent)
  const port = await freePort();
  const mcpUrl = `http://127.0.0.1:${port}/mcp`;
  const http = createHttpServer(async (req, res) => {
    if (!req.url?.startsWith("/mcp")) {
      res.writeHead(404).end();
      return;
    }
    try {
      const body = await readBody(req);
      const server = new McpServer(
        { name: "cotal", version: "0.1.0" },
        { instructions: ORIENTATION_BOOTSTRAP },
      );
      registerCotalTools(server, agent, config, "agy");
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on("close", () => {
        void transport.close();
        void server.close();
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch (e) {
      log(`mcp request error: ${e?.message ?? e}`);
      if (!res.headersSent) res.writeHead(500).end();
    }
  });
  http.listen(port, "127.0.0.1");
  await once(http, "listening");
  log(`cotal MCP for agy on ${mcpUrl}`);

  // agy discovers the cotal MCP server via the GLOBAL config — install now, restore on exit.
  installCotalMcpEntry(mcpUrl);
  process.on("exit", removeCotalMcpEntry);

  const tmpRoot = mkdtempSync(join(tmpdir(), "cotal-agy-"));
  process.on("exit", () => {
    try {
      rmSync(tmpRoot, { recursive: true, force: true });
    } catch {}
  });

  // ---- turn loop state
  let conversationId; // set from the first turn's agy log ("Created conversation <uuid>")
  let turnNo = 0;
  let child;
  let stopping = false;
  let wakeTimer;
  const digest = []; // stateless mode only: rolling window of injections + agy replies

  const agyEnv = () => {
    const env = { ...process.env };
    for (const k of Object.keys(env)) if (k.startsWith("COTAL_")) delete env[k];
    const localBin = join(homedir(), ".local", "bin");
    if (!(env.PATH ?? "").split(":").includes(localBin))
      env.PATH = `${localBin}:${env.PATH ?? ""}`;
    if (!env.TERM) env.TERM = "xterm-256color";
    return env;
  };

  function pushDigest(label, text) {
    const t = String(text ?? "").trim();
    if (!t) return;
    digest.push(`### ${label}\n${t.length > DIGEST_MAX_CHARS ? t.slice(0, DIGEST_MAX_CHARS) + " …[truncated]" : t}`);
    while (digest.length > DIGEST_MAX_ENTRIES) digest.shift();
  }

  function agyCommand(promptFile, logFile) {
    // `-p "$(cat '<file>')"` keeps arbitrary prompt text (quotes/newlines/leading dashes)
    // intact through script(1)'s `sh -c` layer and clear of argv length limits.
    const parts = [
      "agy",
      "-p",
      `"$(cat ${shq(promptFile)})"`,
      "--model",
      shq(model),
      "--dangerously-skip-permissions",
      "--print-timeout",
      shq(PRINT_TIMEOUT),
      "--log-file",
      shq(logFile),
    ];
    if (!STATELESS && conversationId) parts.push("--conversation", shq(conversationId));
    return parts.join(" ");
  }

  function runTurn(prompt) {
    return new Promise((resolve, reject) => {
      const n = ++turnNo;
      const promptFile = join(tmpRoot, `turn-${n}.prompt.txt`);
      const logFile = join(tmpRoot, `turn-${n}.agy.log`);
      const resuming = !STATELESS && !!conversationId;

      let fullPrompt = prompt;
      if (STATELESS && digest.length)
        fullPrompt = `## Session so far (rolling digest — you are a fresh process; this is your memory)\n\n${digest.join("\n\n")}\n\n---\n\n${prompt}`;
      writeFileSync(promptFile, fullPrompt);

      // pTTY wrapper is LOAD-BEARING (see header). -e propagates agy's exit code.
      const proc = spawn("script", ["-qec", agyCommand(promptFile, logFile), "/dev/null"], {
        cwd: workRoot,
        env: agyEnv(),
        stdio: ["ignore", "pipe", "pipe"],
        detached: true, // own process group — lets the timeout kill agy under script(1)
      });
      child = proc;

      let out = "";
      proc.stdout.on("data", (d) => {
        out = (out + d.toString()).slice(-200_000);
      });
      let errTail = "";
      proc.stderr.on("data", (d) => {
        errTail = (errTail + d.toString()).slice(-4000);
      });

      const killTree = (sig) => {
        try {
          process.kill(-proc.pid, sig);
        } catch {
          try {
            proc.kill(sig);
          } catch {}
        }
      };
      const timer = setTimeout(() => {
        log(`turn ${n} timed out after ${TURN_TIMEOUT_MS}ms — killing agy`);
        killTree("SIGKILL");
      }, TURN_TIMEOUT_MS);

      proc.on("error", (e) => {
        clearTimeout(timer);
        child = undefined;
        reject(new Error(`agy spawn failed (is script(1) installed?): ${e.message}`));
      });
      proc.on("close", (code, signal) => {
        clearTimeout(timer);
        child = undefined;
        const text = stripAnsi(out).trim();
        if (text) log(`agy says: ${text.slice(-400)}`);

        // Conversation bookkeeping from the per-turn agy log.
        let agyLog = "";
        try {
          agyLog = readFileSync(logFile, "utf8");
        } catch {}
        const created = agyLog.match(/Created conversation ([0-9a-f-]{36})/i)?.[1];

        if (code !== 0)
          return reject(
            new Error(
              `agy turn ${n} exited code=${code} signal=${signal}: ${
                (errTail.trim() || text).split("\n").slice(-3).join(" | ")
              }`,
            ),
          );
        if (!STATELESS) {
          if (resuming && created)
            return reject(
              new Error(
                `agy turn ${n}: asked to resume conversation ${conversationId} but agy CREATED a new one (${created}) — --conversation resume is not working; set COTAL_AGY_STATELESS=1.`,
              ),
            );
          if (!resuming) {
            if (!created)
              return reject(
                new Error(
                  `agy turn ${n}: no "Created conversation <id>" in the agy log (${logFile}) — cannot chain turns; set COTAL_AGY_STATELESS=1 to run without resume.`,
                ),
              );
            conversationId = created;
            log(`agy conversation ${conversationId}`);
          }
        } else {
          pushDigest(`Turn ${n} — injected input`, prompt);
          pushDigest(`Turn ${n} — your final answer`, text);
        }
        try {
          rmSync(promptFile, { force: true });
        } catch {}
        resolve();
      });
    });
  }

  const setStatusSafe = async (status, activity) => {
    try {
      await agent.setStatus(status, activity);
    } catch {
      /* pre-connect / transient — presence is advisory */
    }
  };

  // ---- inbox pump: one turn at a time; messages landing mid-turn queue and become the next turn
  let pumping = false;
  async function pump() {
    if (pumping || stopping) return;
    pumping = true;
    try {
      for (;;) {
        if (stopping || agent.pendingWake() === 0) break;
        const injection = formatInjection(agent.drainInbox(undefined, "automatic"));
        if (!injection) break;
        await setStatusSafe("working", "agy turn");
        try {
          await runTurn(injection);
        } catch (e) {
          log(`turn failed: ${e.message}`);
          break; // don't spin — wait for the next wake
        }
      }
    } finally {
      pumping = false;
      await setStatusSafe("idle");
    }
  }
  const scheduleWake = (delay = 300) => {
    if (stopping) return;
    clearTimeout(wakeTimer);
    wakeTimer = setTimeout(() => void pump(), delay);
  };

  // ---- cooperative shutdown (manager control frame, signals)
  async function shutdown(code = 0) {
    if (stopping) return;
    stopping = true;
    clearTimeout(wakeTimer);
    try {
      if (child) process.kill(-child.pid, "SIGTERM");
    } catch {
      try {
        child?.kill("SIGTERM");
      } catch {}
    }
    removeCotalMcpEntry();
    try {
      await agent.stop();
    } catch {}
    try {
      http.close();
    } catch {}
    process.exit(code);
  }
  process.on("SIGINT", () => void shutdown(0));
  process.on("SIGTERM", () => void shutdown(0));
  if (process.env.COTAL_CONTROL_SOCKET && process.env.COTAL_CONTROL_TOKEN) {
    startControlServer(
      agent,
      { path: process.env.COTAL_CONTROL_SOCKET, token: process.env.COTAL_CONTROL_TOKEN },
      async () => ({}), // agy has no lifecycle hooks — the control plane is shutdown-only
      { fatalBind: true, onShutdown: () => void shutdown(0) },
    );
  }

  // ---- wait for the mesh link, then boot turn: persona + orientation (+ optional launch prompt)
  const deadline = Date.now() + 60_000;
  while (!agent.connected && Date.now() < deadline)
    await new Promise((r) => setTimeout(r, 250));
  if (!agent.connected)
    throw new Error(
      "cotal-connector-agy: mesh connection not established within 60s — aborting (is the broker up?)",
    );
  log(`joined mesh "${config.space}" as ${config.name} (${agent.id})`);

  const bootParts = [
    `You are "${config.name}"${config.role ? ` (role: ${config.role})` : ""} — an agent on the Cotal mesh (space "${config.space}"), hosted on the Google Antigravity CLI (agy).`,
    `Peers reach you via mesh channels and DMs. Use the cotal_* tools (MCP server "cotal") to read and reply: cotal_send for channels, cotal_dm for direct messages. Work delivered to you arrives as "messages from peers" blocks; a turn that ends without sending a reply is INVISIBLE to peers — always report back over the mesh.`,
    ORIENTATION_BOOTSTRAP,
  ];
  const briefing = agent.channelBriefing();
  if (briefing) bootParts.push(briefing);
  if (persona) bootParts.push(`## Your persona\n\n${persona}`);
  if (initialPrompt) bootParts.push(initialPrompt);

  await setStatusSafe("working", "orienting");
  try {
    await runTurn(bootParts.join("\n\n"));
  } catch (e) {
    log(`boot turn failed: ${e.message}`);
    await shutdown(1);
    return;
  }
  await setStatusSafe("idle");
  log(`boot turn complete (${STATELESS ? "stateless digest mode" : `conversation ${conversationId}`}) — waiting for peer messages`);

  agent.on("incoming", () => scheduleWake());
  agent.on("wake", () => scheduleWake(0));
  agent.on("mention-wake", () => scheduleWake(0));
  scheduleWake(0); // catch anything buffered during boot
}

main().catch((e) => {
  process.stderr.write(`[cotal-agy] fatal: ${e?.stack ?? e}\n`);
  removeCotalMcpEntry();
  process.exit(1);
});
