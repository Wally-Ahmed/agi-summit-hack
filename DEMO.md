# Live demo script (~5 minutes)

Story: **the model you want is locked behind one harness and its subscription —
`hermes-handoff` makes Hermes the front door to the one you already pay for**, any task,
no API credits. Then the receipts: 10 hermetic studies and two upstream PRs.

Zero-setup fallback for judges: **https://hermes-handoff-overview.fly.dev/** — press
**▶ Narrated walkthrough** (top right). 17 narrated scenes cover the product, the
architecture, a live task simulation, every benchmark slide, and the two pull requests.

## 0. Preflight (before the audience arrives)

```bash
gh codespace ssh -c <codespace>          # or any host with the CLIs signed in
cd /workspaces/agi-summit-hack && git pull
hermes auth status openai-codex          # planner brain: "logged in" (ChatGPT OAuth)
node tools/hermes-handoff/bin/hermes-handoff.js status   # config + roster
# if the space is down:  node tools/hermes-handoff/bin/hermes-handoff.js up
```

Notes that bite: run `cotal` commands from the workspace dir the space was created in
(`~/.hermes-handoff.json` → `dir`), not the repo. One agy worker per machine. Detached
spawns inherit the MANAGER's env.

## 1. The product (the money shot)

Show the wizard's eye view first:

```bash
node tools/hermes-handoff/bin/hermes-handoff.js init --no-launch --dir /tmp/demo-ws
# → detects claude/codex/agy, shows auth state and WHICH GATED MODELS each unlocks; pick one
```

Then hand Hermes a task that is **not coding**:

```bash
hermes-handoff ask "Collect the newest three .md files under ~/notes into /tmp/demo-ws/digest.md with a one-line summary each"
cotal console --plain        # narrate: Hermes restates TASK/CONTEXT/DONE-WHEN → DMs the worker → verifies
cat /tmp/demo-ws/digest.md   # the deliverable, on disk, made under the operator's own subscription
```

Point out loud: the planner brain is running on the **ChatGPT subscription via OAuth**
(`hermes auth`), the worker on **Claude Max** — nobody bought API credits.

## 2. Scale-out (30 seconds)

```bash
cotal spawn worker3 --agent agy --detach   # second builder, Google account, our connector
cotal endpoints                            # heterogeneous pool, one roster
```

One sentence: same wiring, N harnesses — fan-out beat serial 3/3-vs-DNF in run 6.

## 3. The receipts (a minute)

Open https://hermes-handoff-overview.fly.dev/ on the projector:

- **② The Benchmarks** — arrow through the timeline; the explainer under each slide has
  the plain-language and technical reads. Highlights: run 3 (harness-per-model beats
  one-loop MCP ~30%), run 5 (subscription inversion), run 9 (**zero hallucinations**),
  run 10 (≈$0 marginal vs $0.14–0.51 metered), run 8 (**no autonomous reclaim** — the
  honest one, with the sqlite autopsy).
- **③ The Pull Requests** — what we're contributing back: the Codex worker connector and
  the first Antigravity connector, built in-tree against Cotal's current core.

## 4. Teardown

```bash
hermes-handoff stop --down
```

## If something breaks

- Planner unresponsive → `hermes auth status openai-codex` (OAuth), then respawn:
  `cotal stop --name planner && cotal spawn planner --agent hermes --detach`.
- Worker won't spawn → `docs/hermes-mesh-runbook.md` (six known failures + fixes); agy:
  delete a stale `cotal` key in `~/.gemini/config/mcp_config.json`.
- No live mesh at all → the fly.dev walkthrough IS the demo; RESULTS.md has every table.
