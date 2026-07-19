# Live demo script (~5 minutes)

Target: show a real cross-vendor handoff — planner receives a task, delegates to an official
harness running on its owner's subscription, worker executes in place, test passes on disk.

## 0. Preflight (before the audience arrives)

```bash
gh codespace ssh -c <codespace>        # or any host with the repo + CLIs signed in
cd /workspaces/agi-summit-hack
export OPENROUTER_API_KEY=$(grep ^OPENROUTER_API_KEY /workspaces/openrouter-subagents/.env | cut -d= -f2-)
export HERMES_MODEL=anthropic/claude-sonnet-4.6
cotal up --detach && sleep 3 && cotal ps          # nats + delivery + manager up
cotal spawn planner --agent hermes --detach
cotal spawn worker  --agent claude --detach       # Claude Code (Max)
cotal spawn worker3 --agent agy    --detach       # Antigravity (our connector)
cotal endpoints                                    # all green
```

Notes that bite: detached spawns inherit the MANAGER's env (export before `cotal up`, not
after); the agy connector allows ONE agy worker per machine; Claude worker permissions come
from `~/.claude/settings.json` (acceptEdits + allow list + `mcp__cotal`).

## 1. The handoff (the money shot)

Terminal A — watch the mesh live:

```bash
cotal console --plain
```

Terminal B — hand the mesh a task with a machine-checkable done condition:

```bash
WORK=$(mktemp -d /tmp/demo-XXXX)
cp -R benchmark/tasks/t1-lru/* "$WORK/"
cotal send ask planner "TASK: complete the task in $WORK (paths relative to it). CONSTRAINT: delegate execution to a builder worker; do not execute yourself. DONE-WHEN: 'cd $WORK && python3 test.py' prints PASS. Report on #general when verified. TASK SPEC: $(cat $WORK/PROMPT.md)"
```

Narrate what scrolls in Terminal A: planner claims → plans → delegates to a builder → builder
goes `working` → builder posts the verified result on `#general`. Then prove it on disk:

```bash
cd "$WORK" && python3 test.py     # PASS
```

## 2. The numbers (30 seconds each)

Open [`benchmark/RESULTS.md`](benchmark/RESULTS.md):

- **Run 3:** mesh handoff beat direct MCP-subagent orchestration ~30% at equal quality.
- **Run 4:** native harness beats foreign harness for Gemini (298s vs 521s, both 7/7).
- **Run 5:** on native subscriptions the latency story inverts — backend+model dominates.
- **Appendix:** the contamination story — why hermetic mode and the template tripwire exist.

## 3. Teardown

```bash
cotal stop --name worker3 && cotal stop --name worker && cotal stop --name planner
cotal down
```

## If something breaks

- Worker won't spawn → `docs/hermes-mesh-runbook.md` (all six known spawn failures + fixes).
- agy writes files elsewhere → the connector passes `--add-dir`; if testing agy raw, you must too.
- Planner 402s → OpenRouter balance; top up, respawn planner.
- Fallback: pre-recorded run in `benchmark/results/*.jsonl` + RESULTS.md tables tell the story
  without a live mesh.
