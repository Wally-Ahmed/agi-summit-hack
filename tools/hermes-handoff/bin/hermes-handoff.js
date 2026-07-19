#!/usr/bin/env node
// hermes-handoff — one front-door to your gated models.
//
// Frontier models are gated behind specific harnesses and subscriptions: gpt-5.6-sol lives
// behind Codex CLI + ChatGPT, Gemini 3.1 Pro (High) behind Antigravity, Claude Opus behind
// Claude Code + Max. This wizard picks the ONE harness you already pay for and wires a
// workflow where Hermes (Nous Research's hermes-agent) plans and hands ANY task — not just
// coding — to that harness under its own legitimate auth, over a local Cotal space.
//
// Commands:
//   hermes-handoff init     guided setup (--harness claude|codex|agy --yes for headless)
//   hermes-handoff ask ".." send a task to Hermes
//   hermes-handoff status   config + live roster
//   hermes-handoff stop     stop the agents (--down also stops the mesh stack)

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const CONFIG_PATH = join(homedir(), ".hermes-handoff.json");
const b = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const ok = (s) => `\x1b[32m${s}\x1b[0m`;
const warn = (s) => `\x1b[33m${s}\x1b[0m`;
const bad = (s) => `\x1b[31m${s}\x1b[0m`;

const HARNESSES = {
  claude: {
    label: "Claude Code",
    bin: "claude",
    agent: "claude",
    unlocks: "Claude Opus 4.8 at max effort (Claude Pro/Max subscription)",
    authed: () =>
      existsSync(join(process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude"), ".credentials.json")),
    authHint: "run `claude` once and log in",
  },
  codex: {
    label: "Codex CLI",
    bin: "codex",
    agent: "codex",
    unlocks: "gpt-5.6-sol at xhigh (ChatGPT subscription)",
    authed: () => existsSync(join(process.env.CODEX_HOME || join(homedir(), ".codex"), "auth.json")),
    authHint: "run `codex login`",
  },
  agy: {
    label: "Antigravity CLI",
    bin: "agy",
    agent: "agy",
    unlocks: "Gemini 3.1 Pro (High), Claude Opus 4.6 Thinking, GPT-OSS 120B (Google account)",
    authed: () => existsSync(join(homedir(), ".gemini")),
    authHint: "run `agy` once and sign in with Google",
  },
};

// ---------- small helpers ----------

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts });
}

function have(bin) {
  const r = run(bin, ["--version"]);
  return r.status === 0 ? (r.stdout || r.stderr).trim().split("\n")[0] : null;
}

// cotal has no --version subcommand; present = the binary resolves and emits its help.
function haveCotal() {
  const r = run("cotal", ["--help"]);
  return !r.error && (r.stdout + r.stderr).length > 0;
}

function die(msg) {
  console.error(bad(`✗ ${msg}`));
  process.exit(1);
}

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) die("not configured yet — run `hermes-handoff init` first");
  return JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
}

function cotal(args, cfg, extraEnv = {}) {
  const r = run("cotal", args, {
    cwd: cfg.dir,
    env: { ...process.env, OPENROUTER_API_KEY: cfg.key || process.env.OPENROUTER_API_KEY || "", HERMES_MODEL: cfg.model, ...extraEnv },
  });
  return r;
}

function stripAnsi(s) {
  return (s || "").replace(/\x1b\[[0-9;]*m/g, "");
}

// ---------- personas ----------

function plannerPersona(harnessLabel) {
  return `---
name: planner
role: planner
subscribe: [general, tasks, results]
allowPublish: [general, tasks, results]
---
You are Hermes, the front-door for this machine's gated-model harness. You PLAN and
DELEGATE — you NEVER execute tasks yourself.

You have exactly ONE builder: \`worker\`, running ${harnessLabel} under the operator's own
subscription. It can take ANY kind of task — research, writing, file organization, data
wrangling, coding — not just software.

For every incoming request:
1. Restate it as a self-contained work item: TASK / CONTEXT (everything the worker needs —
   it shares no memory with you) / DONE-WHEN (a check the worker can verify on disk).
2. DM it to \`worker\`. One item at a time; wait for its reply before sending the next.
3. When the worker reports, verify the reply against DONE-WHEN. If it fell short, send it
   back with exactly what is missing.
4. Report the outcome to the requester on the channel the request arrived on, with
   STATUS / EVIDENCE.

Keep messages short and structured. Track state on the mesh (replies, the results channel),
not in your own memory — it resets between messages.
`;
}

function workerPersona(harness) {
  const model = harness === "agy" ? `model: "Gemini 3.1 Pro (High)"\n` : "";
  return `---
name: worker
role: builder
subscribe: [general, tasks]
allowPublish: [general, tasks, results]
${model}---
You are a builder. You EXECUTE work items assigned by the planner — fully, on your own
machine, under your own account. Work items may be any kind of task (research, writing,
file work, data, code), not just software.

For every assignment (TASK / CONTEXT / DONE-WHEN):
1. Do the work end to end. Ask the planner (reply on the same contextId) only when the
   assignment is genuinely ambiguous or missing context — never to offload decisions you
   can make from the stated constraints.
2. Verify your result against DONE-WHEN before reporting.
3. Reply to the assignment message with STATUS (done | blocked) / EVIDENCE (what you ran,
   what passed, where the artifacts are). Post the same summary to the results channel.
4. If blocked, say exactly what is missing and stop — do not improvise around the spec.
`;
}

// ---------- hermes connector ESM patch ----------
// connector-hermes 0.12.0 ships an ESM bundle that still calls require(); prepend a
// createRequire shim (idempotent, original backed up as launch.js.orig).

function patchHermesLauncher() {
  const launch = join(
    homedir(),
    ".config/cotal/extensions/node_modules/@cotal-ai/connector-hermes/dist/launch.js"
  );
  if (!existsSync(launch)) return "absent";
  const src = readFileSync(launch, "utf8");
  if (src.includes("__cotalCreateRequire")) return "already-patched";
  copyFileSync(launch, launch + ".orig");
  writeFileSync(
    launch,
    `import { createRequire as __cotalCreateRequire } from "node:module";\n` +
      `const require = __cotalCreateRequire(import.meta.url);\n` +
      src
  );
  return "patched";
}

// ---------- init ----------

async function init(flags) {
  console.log(b("\nhermes-handoff — one front-door to your gated models\n"));

  // 1. Preflights that don't depend on the harness choice.
  if (!haveCotal()) die("Cotal CLI not found on PATH — install it first (https://cotal.ai), then re-run");
  console.log(`  cotal        ${ok("✓ detected")}`);
  const extList = stripAnsi(run("cotal", ["ext", "list"]).stdout || "");
  const hermesExt = extList.includes("connector-hermes");
  console.log(`  hermes conn  ${hermesExt ? ok("✓ installed") : bad("✗ missing")}`);
  if (!hermesExt) die("the Hermes connector is not installed — `cotal setup` and add @cotal-ai/connector-hermes");
  if (!have("hermes")) {
    console.log(warn("  hermes bin   not on PATH — install with: uv tool install \"hermes-agent>=0.16,<0.17\""));
  }

  // 2. Scan harnesses.
  console.log(`\n${b("Detected harnesses")} ${dim("(each unlocks models gated to its subscription)")}`);
  const found = [];
  for (const [key, h] of Object.entries(HARNESSES)) {
    const ver = have(h.bin);
    const authed = ver ? h.authed() : false;
    if (ver) found.push(key);
    console.log(
      `  [${key}] ${h.label.padEnd(16)} ${ver ? ok("✓ " + ver) : bad("✗ not installed")}` +
        (ver ? `  ${authed ? ok("✓ auth") : warn("? auth — " + h.authHint)}` : "")
    );
    if (ver) console.log(`        ${dim("unlocks: " + h.unlocks)}`);
  }
  if (found.length === 0) die("no supported harness found — install Claude Code, Codex CLI, or Antigravity CLI first");

  // 3. Choose one.
  let harness = flags.harness;
  if (!harness && flags.yes) die("--yes requires --harness <claude|codex|agy>");
  const rl = flags.yes ? null : createInterface({ input: process.stdin, output: process.stdout });
  if (!harness) {
    harness = (await rl.question(`\nPick your harness [${found.join("/")}]: `)).trim();
  }
  if (!HARNESSES[harness]) die(`unknown harness "${harness}" (expected claude, codex, or agy)`);
  if (!found.includes(harness)) die(`${HARNESSES[harness].label} is not installed on this machine`);
  const H = HARNESSES[harness];

  // agy merges a "cotal" entry into the GLOBAL ~/.gemini/config/mcp_config.json while a
  // worker is live; a leftover entry from an unclean shutdown blocks the next spawn.
  if (harness === "agy") {
    const mcpPath = join(homedir(), ".gemini/config/mcp_config.json");
    if (existsSync(mcpPath)) {
      try {
        const mcp = JSON.parse(readFileSync(mcpPath, "utf8"));
        if (mcp.mcpServers && mcp.mcpServers.cotal) {
          const clean = flags.yes || (await rl.question(warn("Found a stale 'cotal' entry in ~/.gemini/config/mcp_config.json (unclean shutdown). Remove it? [Y/n]: "))).trim().toLowerCase() !== "n";
          if (clean) {
            delete mcp.mcpServers.cotal;
            writeFileSync(mcpPath, JSON.stringify(mcp, null, 2));
            console.log(ok("  cleaned stale agy MCP entry"));
          } else {
            die("cannot spawn an agy worker while a stale 'cotal' MCP entry exists");
          }
        }
      } catch {
        /* unreadable json — leave it to the connector's fail-loud */
      }
    }
    const agyConn = extList.includes("cotal-connector-agy");
    if (!agyConn) die("the Antigravity connector is not installed — `cotal ext` add cotal-connector-agy");
  }
  if (harness === "codex" && !extList.includes("cotal-connector-codex")) {
    die("the Codex connector is not installed — `cotal ext` add cotal-connector-codex");
  }

  // 4. Planner brain (Hermes needs an OpenRouter key + a tool-calling model).
  let key = process.env.OPENROUTER_API_KEY || flags.key;
  if (!key && !flags.yes) {
    key = (await rl.question("\nOpenRouter API key for the Hermes planner brain (or set OPENROUTER_API_KEY): ")).trim();
  }
  if (!key) die("no OpenRouter key — the planner brain needs one (export OPENROUTER_API_KEY or pass --key)");
  const model = flags.model || "anthropic/claude-sonnet-4.6";

  // 5. Workspace: the Cotal space + personas live here; handed-off tasks run here too.
  const dir = resolve(flags.dir || join(homedir(), "hermes-handoff"));
  mkdirSync(join(dir, ".cotal", "agents"), { recursive: true });
  writeFileSync(join(dir, ".cotal", "agents", "planner.md"), plannerPersona(H.label));
  writeFileSync(join(dir, ".cotal", "agents", "worker.md"), workerPersona(harness));
  const patched = patchHermesLauncher();
  console.log(`\n  workspace    ${ok(dir)}`);
  console.log(`  personas     ${ok("planner.md, worker.md")} ${dim("(.cotal/agents)")}`);
  console.log(`  hermes patch ${patched === "patched" ? ok("applied (createRequire shim)") : dim(patched)}`);

  const cfg = { dir, harness, model, key, createdAt: new Date().toISOString() };
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  console.log(`  config       ${ok(CONFIG_PATH)}`);
  if (rl) rl.close();

  if (flags["no-launch"]) {
    console.log(`\n${b("Configured.")} Launch later with: hermes-handoff up`);
    return;
  }
  await up(cfg);
}

// ---------- up / launch ----------

async function up(cfg) {
  cfg = cfg || loadConfig();
  const H = HARNESSES[cfg.harness];
  console.log(`\n${b("Launching")} ${dim(`mesh + Hermes planner + ${H.label} worker`)}`);

  let r = cotal(["up", "--detach"], cfg);
  if (r.status !== 0 && !/already|running/i.test(stripAnsi(r.stderr + r.stdout))) {
    die(`cotal up failed:\n${stripAnsi(r.stderr || r.stdout)}`);
  }
  console.log(`  mesh     ${ok("up")}`);

  r = cotal(["spawn", "planner", "--agent", "hermes", "--detach"], cfg);
  if (r.status !== 0) die(`planner spawn failed:\n${stripAnsi(r.stderr || r.stdout)}`);
  console.log(`  planner  ${ok("spawned")} ${dim("(hermes · " + cfg.model + ")")}`);

  r = cotal(["spawn", "worker", "--agent", H.agent, "--detach"], cfg);
  if (r.status !== 0) die(`worker spawn failed:\n${stripAnsi(r.stderr || r.stdout)}`);
  console.log(`  worker   ${ok("spawned")} ${dim("(" + H.label + ")")}`);

  const roster = stripAnsi(cotal(["endpoints"], cfg).stdout || "");
  console.log(`\n${roster.trim()}\n`);
  console.log(b("Ready.") + ` Hand Hermes a task:\n  hermes-handoff ask "organize ~/Downloads into dated folders"\n` + dim("  (watch live:  cotal console --plain   ·   roster:  hermes-handoff status)"));
}

// ---------- ask / status / stop ----------

async function ask(taskText, flags) {
  if (!taskText) die('usage: hermes-handoff ask "<task>"');
  const cfg = loadConfig();
  const r = cotal(["send", "ask", "planner", taskText], cfg);
  if (r.status !== 0) die(`send failed:\n${stripAnsi(r.stderr || r.stdout)}`);
  console.log(ok("→ handed to Hermes") + dim(" — it will delegate to your " + HARNESSES[cfg.harness].label + " worker"));
  const watchSecs = Number(flags.watch || 0);
  if (watchSecs > 0) {
    console.log(dim(`watching the space for ${watchSecs}s …`));
    spawnSync("timeout", [String(watchSecs), "cotal", "console", "--plain"], {
      cwd: cfg.dir,
      stdio: "inherit",
      env: process.env,
    });
  }
}

async function status() {
  const cfg = loadConfig();
  const H = HARNESSES[cfg.harness];
  console.log(`${b("hermes-handoff")}  harness=${H.label}  planner=${cfg.model}  dir=${cfg.dir}`);
  const r = cotal(["endpoints"], cfg);
  console.log(stripAnsi(r.stdout || r.stderr).trim());
}

async function stop(flags) {
  const cfg = loadConfig();
  for (const name of ["worker", "planner"]) {
    const r = cotal(["stop", "--name", name], cfg);
    console.log(`  ${name}  ${r.status === 0 ? ok("stopped") : warn(stripAnsi(r.stderr || r.stdout).trim())}`);
  }
  if (flags.down) {
    const r = cotal(["down"], cfg);
    console.log(`  mesh   ${r.status === 0 ? ok("down") : warn(stripAnsi(r.stderr || r.stdout).trim())}`);
  }
}

// ---------- arg parsing ----------

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      if (["yes", "no-launch", "down"].includes(key)) flags[key] = true;
      else flags[key] = argv[++i];
    } else positional.push(a);
  }
  return { flags, positional };
}

const { flags, positional } = parseArgs(process.argv.slice(2));
const cmd = positional[0];

try {
  if (cmd === "init") await init(flags);
  else if (cmd === "up") await up(null);
  else if (cmd === "ask") await ask(positional.slice(1).join(" "), flags);
  else if (cmd === "status") await status();
  else if (cmd === "stop") await stop(flags);
  else {
    console.log(`${b("hermes-handoff")} — one front-door to your gated models

  init    guided setup: pick your ONE harness, wire Hermes to it
          ${dim("--harness claude|codex|agy  --dir <ws>  --model <openrouter-id>  --key <k>  --yes  --no-launch")}
  up      launch (or re-launch) the configured mesh + planner + worker
  ask     hand Hermes a task ${dim('· ask "…" [--watch <secs>]')}
  status  config + live roster
  stop    stop the agents ${dim("[--down: also the mesh stack]")}
`);
  }
} catch (e) {
  die(e.message || String(e));
}
