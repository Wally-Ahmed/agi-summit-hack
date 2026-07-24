# HANDOFF — agi-summit-hack

> **Standing cross-session / compact-recovery file.** If you (Claude) are reading this after a
> crash, `/compact`, or fresh session: this is the single source of truth. Read it once, then act.
> Verify claims against `git log --oneline -5` and `cotal ps` before trusting them.

_CHECKPOINT 7 — 2026-07-23 ~00:00 UTC (compact prep). Everything below is PUSHED (main
clean at origin) and the site is DEPLOYED (fly build stamp bottom-left shows sha·time·26
scenes — no-cache serving, so a plain reload is always current). Post-checkpoint-6 work:
**(1) PR audit vs v0.4:** #254/#255 need NO update — MERGEABLE at upstream HEAD, connector
interface byte-identical since our merge-base (only docs-bundle version strings changed),
siblings gained nothing to mirror, work pools still impose zero agent-side requirements.
Only drift: our packages declare 0.13.1 vs siblings 0.13.2 — cosmetic, self-heals via the
changesets fixed group; fold into the inevitable post-first-merge rebase. "UNSTABLE" = CI
never ran (fork PRs await maintainer approve-and-run). NO PR touches without Wally.
**(2) Site iteration wave (all live):** "dormant" glossed everywhere (= in the release but
switched off; deliberate staged rollout, NOT a bug — narration already explains it);
Run 8 slide carries an amber STALE—cleared-by-Run-11 chip; NEW #v04gap section (four gaps:
no owner / no permissions / no switch / no trigger, each with its closer + verdict "next
update is all wiring, no engine work"); Run 11 slide (index 8) + voiced scene n:26 placed
RIGHT AFTER the Run 8 scene (slider flows 18→26→roadmap; roadmap slideTo(9)); badges row:
real links (github + zip download) split into a lightly-separated underlined group (small
gap + dashed divider, original colors); finale photo re-baked at HALF the frame from the
ORIGINAL ~/Downloads/IMG_9746.JPG (never from baked frames — resolution).
**(3) Narration truth-pass (deployed):** scene 21 no longer claims conventions "remain the
answer" — now "conventions WERE the working answer — until we switched their machinery on
ourselves, and Run eleven made the recovery real" (scene21.mp4 re-timed to 47.8s from its
3 stills); scene 26 opens with a brief v0.4 primer (leases, redelivery) since it plays
before the deep-dive scenes.
**(4) 4K walkthrough MP4 DELIVERED:** ~/Desktop/hermes-handoff-walkthrough-4k.mp4 —
3840×2160 crf16, 12:52, 170.8MB, 26 scenes, per-scene adelay audio mux, supersampled
dsf=3 capture + INSTANT-CUT transitions (screencast smooth-scrolls measured ~12fps =
judder; scrollTo/scrollIntoView patched to behavior:instant during recording). Full
pipeline + scripts preserved in the SKILL below (and /tmp/walkrec2 while it survives).
**(5) REUSABLE SKILL CREATED:** ~/.claude/skills/walkthrough-builder/ (SKILL.md + 5
references; recording scripts embedded verbatim; retrieval-tested 4/4) — global across
projects; copy-paste planning prompt for other agents saved to
~/Desktop/walkthrough-plan-prompt.txt.
**(6) Codespace mesh:** left UP after Run 11 (manager + workerc idle; workerb killed by
the benchmark). Codespace auto-idles; on next use expect 24h-cred rot → `cotal doctor
auth --fix` from /workspaces/agi-summit-hack, and spawn builders with FRESH names.
**OPEN ITEMS: none pending.** Optional next: v0.4.x wishlist → could become an upstream
issue/PR (needs Wally's explicit approval per standing rule); Run 11 n=1 → repeatability
runs; watch #254/#255 for maintainer CI approval._

_CHECKPOINT 6 — 2026-07-22 ~15:30 UTC. **RUN 11 LIVE PROOF: DONE — PASS** (closes checkpoint
5's (A) list; (B) walkthrough arc was already shipped). Log: `RESULT pass=true total=122s
reassignments=1 finisher=workerc` · `COMMITTED won=true … attempt=3 fencingToken=2` · terminal
fact `disposition:"committed"` read back. Timeline: lease→workerb working in 9s → killed +34s →
next ack_wait pulse flags OFFLINE → RE-LEASE token 2 → workerc working +47s → test.py PASS →
commit +122s. Artifact pulled to `benchmark/results/reclaim.log` (committed on the Mac).
**What it took (beyond checkpoint 5's plan):** (1) supervisor self-broker mode
(`RECLAIM_SELF_BROKER=1` + `RECLAIM_NATS_BIN=` cotal's bundled binary — on the Codespace
`/usr/local/share/nvm/versions/node/v24.14.0/lib/node_modules/cotal-ai/node_modules/@eplightning/nats-server-linux-x64/bin/nats-server`);
(2) run-reclaim.sh `${VAR:+VAR=…}` passthroughs REMOVED — bash treats expansion-produced words
as commands, not prefix assignments (with the var set the supervisor silently never launched);
plain env inheritance instead; (3) **dmTask verb fixed to `send dm <agent>`** — `send ask
<name>` is ROLE-anycast: exit 0, message blackholes (Run 8's planner asks only worked because
"planner" is name AND role); (4) victim-wait window now `BENCH_VICTIM_POLLS` (default 120×5s —
claude cold turns need minutes). **Codespace ops knowledge:** mesh state lives in the REPO's
`.cotal/` (cwd-keyed) — `cotal up --detach` FROM `/workspaces/agi-summit-hack` (not
/tmp/hh-e2e; hermes-handoff `up` wrapper failed, direct cotal worked); daemon creds expire in
**24h** → after a sleep the delivery daemon boots `membership: Authorization Violation` and
sends DROP SILENTLY — **`cotal doctor auth --fix` heals it**; agent profiles in
`.cotal/agents/*.md` (worker2/worker3 carry foreign-model launchOptions — never spawn those
with `--agent claude`; the `--model_max_output_tokens` crash); after ANY failed spawn use a
FRESH name (reused "worker" = roster-visible but delivery-dead zombie); builders verified
fable-5@xhigh (33× `"model":"claude-fable-5"` in the finisher transcript, zero Opus).
**MATERIALS UPDATED (task #25, committed locally NOT pushed):** RESULTS.md Run 11 section
(top) + Run 8 superseded banner + loop-closed upstream bullet; README 11 runs/9 studies +
finding 5 closes the loop; overview.html Run 11 slide + EXPLAIN entry (POSITIONAL array —
keep slide/entry order aligned), Run 8 chip/verdict superseded, shimnote + contributions card
proof lines (JS syntax-checked, 10 slides = 10 entries). **Walkthrough is 26 scenes now** — n:26 (after n:25, before the finale): the Run 11 slide
(slideTo(8)) with live numbers, voiced (walkthrough/scene26.mp3, 40.8s, STT-verified); the
slider-walk scenes previously skipped the inserted Run 11 slide, and the roadmap scene was
retargeted slideTo(9). (A lightbox experiment for fit scenes was REVERTED — the shipped fix
is the sticky strip + a scroll clamp to its pinning threshold (natTop-64) in tour(); finale
is fit:"contain", scenes 24/25 are cover. Reusable knowledge now lives in the personal skill
~/.claude/skills/walkthrough-builder/ — engine, narration, scene videos, 4K recording.)
**4K WALKTHROUGH RECORDING (2026-07-22 ~17:45):** `~/Desktop/hermes-handoff-walkthrough-4k.mp4`
(3840×2160 h264 crf18, 751s, 26 scenes, 138.8MB). Pipeline preserved at /tmp/walkrec2
(record.mjs + mux.py): playwright chromium with **--force-device-scale-factor=3** (supersampled: compositor 5760×3240 downscaled into the 4K capture — kills screencast JPEG softness; encode crf16) (context
deviceScaleFactor does NOT reach the recorder — it pads CSS frames into a corner; probe
first!), --autoplay-policy=no-user-gesture-required so audio 'ended' drives real scene
timing, instrumented playScene logs per-scene ms offsets → mux places each scene's mp3 via
adelay (no cumulative drift). Finale photo source: ~/Downloads/IMG_9746.JPG (4032×3024;
upright derivative /tmp/win-upright.jpg 1500×2000) — always re-bake panes from it, never
from baked frames. (That push + deploy HAPPENED — everything through checkpoint 7 is on origin/main and the live site.) Also this session:
`antigravity-openrouter-subagents` published PUBLIC + hermetically verified
(github.com/Wally-Ahmed/antigravity-openrouter-subagents); Codespace fable check passed (no
downgrade, nothing to compact)._

_COMPACT CHECKPOINT 5 — 2026-07-22 ~13:00 UTC. Two live workstreams + housekeeping.
**(A) #258 ADOPTION — "prove the fix ourselves" (Run 11), Wally's explicit direction:
NO upstream PR (we aren't on their team), build it in OUR repo, prove their v0.4 system
closes the Run-8 gap, publish as a NEW benchmark, and mark Run 8 as SUPERSEDED/stale.**
Verified reality first (2 subagents, cited against /tmp/cotal-v04 = clone rebased on
upstream main post-v0.4): #258's work-pool machinery is REAL + PUBLICLY exported from
`@cotal-ai/core` (index.ts:13 → endpoint-work.ts: workPoolContext:72, enqueueWorkItem:190,
leaseWorkItem:386, commitWorkItem:577, readWorkTerminal:524, reconcileWorkItem:731) but
DORMANT for chat-plane agents — two hard blockers I re-verified myself: (1) wrong topology
(a pool is owned by an ENDPOINT holding the single AckExplicit pull consumer; redelivery on
lease-expiry goes back to the OWNER to reassign — our mesh is a Hermes AGENT DMing worker
AGENTS, no endpoint/owner exists), (2) NO agent credential carries work-pool grants (grepped
endpoint-grants.ts — agents get delivery+self-lifecycle only, zero epw/epf/records-KV; no CLI
verb either). connector-core does NOT re-export it — BUT a sibling package CAN import
`@cotal-ai/core` directly (it's a real workspace dep), which is our entry point.
BUILT (committed local `c61c812`, NOT pushed): `benchmark/reclaim/{package.json,
supervisor.mjs,drytest.mjs,.gitignore}` + `benchmark/run-reclaim.sh` (chmod +x). The
**supervisor** plays the missing owner-endpoint role: connects NATS (RECLAIM_NATS, default
127.0.0.1:4222, optional RECLAIM_CREDS) → isolated space "reclaim" (own EPW_reclaim streams,
never the live space) → createEndpointStreams → workPoolContext → poolConsumerConfig/
poolDurable(supervisor/tasks, ack_wait 15s) → enqueue ONE work item = the benchmark task →
lease to an idle builder (agent-kind worker = NO epoch fencing, simplest honest path) → DM it
via `cotal send ask` (chat plane stays real) → holds the pull msg UNACKED; a killed builder
surfaces as ack_wait redelivery, on which the owner re-leases to the next idle builder
(attempt=deliveryCount, fencing token bumps) + re-DMs; test.py is the ONLY judge; on PASS →
commitWorkItem → readWorkTerminal. `run-reclaim.sh` mirrors run-failover.sh (same template
tripwire, wait-for-idle, strict $2=="builder" victim match, kill victim at +20s) but needs
>=2 idle builders. **DRY-VERIFIED locally**: `benchmark/reclaim/drytest.mjs` spawns a throwaway
nats-server and runs the full enqueue→lease(A)→no-ack→ack_wait-redelivery→re-lease(B,token2)
→commit(B)→terminal cycle → prints PASS, against PUBLISHED `@cotal-ai/core@0.13.2` (all 9
symbols confirmed exported; nats stack `@nats-io/{transport-node,jetstream,kv,nats-core}`).
`nats-server` now brew-installed on the Mac. NOT yet run live.
**LIVE PROOF PENDING on the Codespace** (`glowing-acorn-q79w9x4vj4wx3xrgj`, now BOOTED):
`/tmp/hh-e2e` mesh workdir is GONE (shutdown wipes /tmp) — must re-stand. Codespace has
cotal/node(v24)/npm; `nats-server` NOT on PATH (cotal bundles/spawns its own — TBD where);
mesh CONFIG persists at `~/.cotal/` (current-mesh="main", meshes/main.json 137B survived —
`~/.cotal/meshes/main.json`). hermes-handoff tool at `/workspaces/agi-summit-hack/tools/
hermes-handoff/bin` (per HANDOFF: `hermes-handoff init --harness claude --brain codex-oauth`
→ `up`; live space was /tmp/hh-e2e). NEXT: re-stand mesh + spawn 2nd builder → copy
benchmark/reclaim + run-reclaim.sh via `gh codespace cp` (NOT a repo push — Codespace headless
git auth is stale; bundle-back if committing there) → probe whether the mesh nats-server is
open-mode on 4222 (if so supervisor attaches with no creds; else self-spawn a private broker —
pool is independent of the chat plane either way) → run run-reclaim.sh → capture
`benchmark/results/reclaim.log` as Run 11 evidence.
**LIVE-PROOF PROGRESS 2026-07-22 (Codespace `glowing-acorn-q79w9x4vj4wx3xrgj`, BOOTED):**
(1) Repo on the Codespace **already fast-forwarded to `e8fa9d6`** via `git pull --ff-only
origin main` — so `benchmark/reclaim/` + `run-reclaim.sh` ARE present at
`/workspaces/agi-summit-hack` (NO `gh codespace cp` needed). Untracked there:
`.cotal/renewal.json` (runtime cred — gitignored, NEVER commit) + `mesh-handoff-proof.txt`.
(2) Persisted mesh config `~/.cotal/meshes/main.json` = `{space:"main",
server:"nats://127.0.0.1:4222", root:"/tmp/hh-e2e", **mode:"auth"**, ts:2026-07-19}`.
**KEY REALIZATION — mode:"auth"**: the mesh NATS on 4222 requires creds, so the supervisor
should NOT attach there. Cleanest path: **supervisor self-spawns its OWN private open-mode
nats-server for the work pool** (exactly what `drytest.mjs` already does + proved) and uses
the `cotal` CLI for chat-plane DMs — this DECOUPLES the pool broker from the auth'd mesh
broker (the pool is chat-plane-independent). **ACTION NEEDED before running: supervisor.mjs
does NOT yet self-spawn a broker** (only drytest.mjs does) — add a self-broker mode (spawn
nats-server on an ephemeral port, point workPoolContext at it) OR pass RECLAIM_CREDS at a
mesh cred file under `~/.cotal/auth/creds/`. Self-broker is the honest, simplest choice.
(3) hermes-handoff CLI (`node tools/hermes-handoff/bin/hermes-handoff.js`): verbs
**init / up / ask / status / stop [--down]**. Re-stand with `up` (relaunches mesh + planner
+ worker); `/tmp/hh-e2e` root was wiped by shutdown — confirm `up` recreates it. Need a
SECOND idle builder for reassignment (run-reclaim.sh requires >=2): spawn via
`cd <mesh root> && cotal spawn worker --detach` after `up`. NEXT SESSION: (a) small
supervisor.mjs self-broker edit; (b) `up` + spawn 2nd builder + `status` to confirm 2 idle
builders; (c) `bash benchmark/run-reclaim.sh` on the Codespace; (d) pull `reclaim.log` back
(bundle/scp — headless git auth stale) as Run 11 evidence; (e) then RESULTS.md Run 11 +
mark Run 8 superseded, site verdict update. Codespace headless git push is STALE — commit
via bundle-back to the Mac if needed.
**(B) WALKTHROUGH v0.4 ARC — SHIPPED 2026-07-22 (commit "Walkthrough v0.4 arc"): tour now
25 SCENES — n:24 "Inside v0.4 — built, shipped… dormant" (44.2s) + n:25 "So we switched it
on ourselves" (50.4s) inserted after the n:21 kicker; #v04flow diagram section in the arch
panel (reuses shimflow CSS); upstream-contributions card rewritten (influence +
first-consumer story); README 23→25 scenes. 3-frame 1800×600 schematics per scene (HTML →
Playwright screenshots via localhost:8901 — file:// is blocked in the MCP; charset meta
required or mojibake) → ffmpeg per-frame clips concat (NOT concat-demuxer durations — it
overshoots; -loop 1 -t per-clip then -c copy) at exact narration length. Deployed,
byte-verified live (page + 6 assets), scene-jump spot-checked in live browser. Original
spec kept for reference:**
"actually explain the v0.4 findings in the walkthrough — the findings, how we changed our
project in response, and how our contributions influenced their direction." Current v0.4
content is THIN: only scene n:21 (upstream-impact kicker) + the run-8 slide verdict/EXPLAIN[]
line (overview.html:752, 886) mention #258. Need a real arc (likely 2 scenes ~n:24/25 after
n:21, OR expand 21): (1) what v0.4/#258 IS + our deep-dive findings (built, exported, DORMANT;
endpoint-topology; no agent grants), (2) how WE responded (PR rebases + MESH_FIRST_STEER; the
Run 11 reclaim supervisor ADOPTING the machinery, dry-verified on 0.13.2 — the "we became the
first consumer" beat), (3) the INFLUENCE story (Run 8 public → #258 within 24h, per Cotal team
a direct response). Scene-visual pipeline: NO generator script exists — scene21/22/23 PNG+MP4
were hand-built (git a83bece); ffmpeg at /opt/homebrew/bin. Follow scene rules (every run()
sets own tab; measured .tabs offset; contain-fit = video-only). TTS = ElevenLabs
DbwWo4rVEd5NrejHYUnm + STT round-trip verify. Walkthrough pushes/deploys are APPROVED
territory (Wally: "you can update the walkthrough with my approval").
**Housekeeping this session:** caption overlay now AUTO-FADES ~3–6s after each scene start
(clearTimeout-reset per scene; CSS .caption 1.1s fade-out / .show 0.4s in) so it never
occludes content — deployed+verified live. Scene 4 reframed "planner never writes code" →
"only delegates — ANY task, not just code" + scene3.mp3 re-recorded (STT-verified). Both
commits (196ff49, f29fcc4) pushed to main. **PR HEALTH audit (subagent, read-only): #254/#255
both MERGEABLE vs current upstream HEAD, zero merge conflicts, NO re-sync needed (0.13.1→0.13.2
core bump is workspace-relative, lockfile untouched), no behavioral drift touching our shims
(#281 skills-distribution only regen'd docs-bundle.generated.ts). Land-ready.**
**STANDING RULES reaffirmed this session (also in memory):** NEVER touch Cotal PRs #254/#255
or fork branches without Wally's per-change approval (memory: pr-update-approval.md) — read-only
audits fine; pushes to OUR main need his ok too; walkthrough updates are pre-approved. Brain-swap
Run 9 study was CANCELLED pre-execution (memory: brain-swap-dropped.md) — do not resume.
MemPalace MCP still DROPPED (run /plugin to revive). Open tasks #24 (live Run 11 proof,
in_progress), #25 (materials/adoption story), #27 (walkthrough v0.4 arc)._

_COMPACT CHECKPOINT 4 — 2026-07-21 ~14:00 UTC. Additions since the 12:30 stamp below:
(e) PR bodies #254/#255 amended live with **Prior art** sections (gh pr edit; canonical in
docs/pr-body-*.md, drafts doc notes the amendment); (f) walkthrough scene 20 "idle wake"
deep-dive — 3-frame schematic (their claude pipeline / their codex dead end / our
push-by-respawn) + narration, inserted after the PR beat — site now 20 scenes;
(g) ALL 20 scenes re-voiced to ElevenLabs voice DbwWo4rVEd5NrejHYUnm (STT→proofread→TTS;
old George mp3s recoverable from git history; transcript fixes: Kotil→Cotal, weight→wait,
nine→eight studies, scene 16 stale failover line dropped); (h) transport bar is now a
vertical right-edge rail; (i) CLAUDE.md gained the standing **Orchestrator Mode**
directive (break work down → subagents → glue → verify; Wally's instruction);
(j) tour auto-scroll now leaves clearance for the sticky media strip when a scene shows a
visual (strip never pins over the focused section — layout deliberately UNCHANGED, fix is
scroll-side only, per Wally); (k) scene-19 GitHub screenshots retaken natively wide
(1800×600) so repo names aren't cropped by the strip's cover-fit. Voice settled on
DbwWo4rVEd5NrejHYUnm after a brief round-trip (bTEswx… tried and reverted; DbwWo4 files
reused from /tmp cache + git — no extra TTS spend). All deployed + curl-verified
byte-exact on fly.dev. Desktop MP4 remains the old 18-scene
George-voice cut — re-record when Wally wants.
Amended post-compact: (l) Run 5 gained its third arm (Antigravity on the Google sub,
restated from run 4) + tour auto-scroll now anchors the union of focused + spotlighted
nodes (commit e723a59); (m) Run-8 failover DEEP DIVE (3 subagents; memory:
cotal-failover-gap.md): upstream Cotal has NO autonomous reclaim — the offline presence
event dies at the connector boundary, recovery is a cold `cotal spawn`; the only fix is
dormant: PR #258 "v0.4 control surface and agent lifecycle" (merged 2026-07-20 — per the
Cotal team, a DIRECT RESPONSE to our benchmarks, source: Wally). Upstream-impact beat
added to RESULTS.md run-8 Read, overview run-8 slide + explainer, and README finding 5.
(n) 🥇 WE WON — 1st place, Cotal sponsor track (per Wally; announced at the event, nothing
public online yet as of 07-21 afternoon — checked Luma/web/Cotal GitHub+blog). Site: gold
header badge + README masthead line; walkthrough now 22 SCENES — n:21 upstream-impact
(43s 3-frame mp4: timeline → real merged-PR-#258 screenshot → v0.4 machinery mapping) and
n:22 the win (1800×600 composite: gold FIRST PLACE + Wally-with-sponsors photo, source
upright at /tmp/win-upright.jpg), both appended as project-tab kickers AFTER the n:8
finale — benchmark-tab scenes can't show the media strip (it docks inside #arch) and
slideTo() guards on the benchmarks view, so kickers must not sit between slide scenes.
(o) Shim deep-dive shipped on THREE surfaces: live PR bodies #254/#255 gained "The shim,
in detail" (engineer prose from a verified fact-map — ack-at-drain at-most-once stated
honestly; canonical docs/pr-body-*.md, commit 57d45fd); #shimflow diagram appended
INSIDE the arch panel (strip stays pinned there); scene 23 "Inside the shim —
push-by-respawn" (50.3s + 3-frame mp4) inserted after idle-wake → tour now 23 SCENES.
(p) Scene 22 photo fixed properly: per-scene `fit:"contain"` flag (sceneVis 2nd arg;
contain scenes are VIDEO-ONLY — img fallback ghosts through the letterbox), composite
rebuilt with the photo at full 560px height on bg #07090e (matches strip → invisible
letterbox); cover-crop varies with viewport width, so band-fitting was unwinnable.
(q) PR branches refreshed against upstream's v0.4 push: rebased clean onto main (#258
never touches connector surface), versions → 0.13.1, #261 `MESH_FIRST_STEER` folded into
both shims (3 sites each: import, MCP instructions, boot prompt), rebuilt/verified,
force-pushed (heads 1169415b/59e35fba, MERGEABLE), rebase comments on both PRs; fork
workspace lives at /tmp/cotal-v04 (pnpm@11 now on the Mac).
Tour-scroll rules learned this session: tab bar is 51px (measure, don't assume 64);
every scene run() must set its OWN tab (slideTo no-ops off-view); fb:"start" tucks the
previous sibling behind the occluder. Desktop MP4 still the old 18-scene cut. Nothing
else in flight._

_Last updated: 2026-07-21 ~12:30 UTC — post-checkpoint-3 polish session: (a) runs 1–2 & 4
COMBINED into one six-arm matrix (identical hermetic suite; run numbers kept as aliases) in
RESULTS.md + slider + walkthrough — counts now "10 runs · 8 studies"; (b) walkthrough scene 19
(open-source MCP servers, GitHub screenshots, ElevenLabs George) + scene visuals unclipped
(sticky top 12→64px) + transport bar (clickable per-scene timeline + pause/play); (c) written
OSS mentions: header badge github.com/Wally-Ahmed + project-tab card + README row linking
openrouter-subagents & gpt-subagents-subscription; all deployed + verified on fly.dev.
(d) Connector-pipeline investigation DONE (2 subagents) — see memory
`cotal-connector-pipelines.md`: upstream connectors are all push-into-live-session (claude =
wake-nudge + hook additionalContext at turn boundaries); their codex was PULL-ONLY, failed
empirically, removed 5b3eb21e; their push fix PR #97 sits unreviewed since Jun 23 (tempers
#254/#255 latency expectations); our push-by-respawn (exec-resume) is original — no upstream
mention of it. Desktop MP4 still the 18-scene cut (site now 19 scenes) — re-record optional.
Submission complete; PRs #254/#255 still awaiting maintainer workflow-approval._

## ⚠️ Read first — COMPACT CHECKPOINT 3 / POST-SUBMISSION STATE (Jul 20–21 UTC); MAIN @ latest

**No task is in flight.** Submission is complete end-to-end. Open items are all
wait-or-optional: (1) watch PR CI once a Cotal maintainer approves workflows
(`gh pr checks 254 --repo Cotal-AI/Cotal` / `255`); (2) optional routing-policy study;
(3) Wally-only: Mac `gpt-subagents-subscription` MCP `npm run login` if needed, and its
repo clone is 1 commit ahead of origin (plain `git push` syncs it).

- **Codespace MemPalace snapshot in git**: `backups/codespace-mempalace/` (hallways.json +
  chroma palace, wing agi_summit_hack only, originally mined Jul 18 from graphify output —
  the post-Jul-18 story lives in claude-mem/HANDOFF, not the palace). **Sync is AUTOMATIC:
  the repo's `.claude/settings.json` runs `scripts/sync-codespace-palace.sh` on
  SessionStart AND SessionEnd of every Claude session on the Codespace ($CODESPACES-gated;
  no-op elsewhere/when unchanged). Start-side run makes it crash-resilient — a session that
  dies uncommitted is flushed by the next session's start; the script also pushes commits
  stranded by stale auth. Restore is automatic too: bootstrap.sh now prefers the committed
  snapshot over re-mining. One-time: approve the project-hooks trust prompt on the
  Codespace.** ⚠️ Codespace git auth is STALE in headless
  `gh codespace ssh` sessions (no GITHUB_TOKEN, `gh auth token` empty) — pushes only work
  from an interactive Codespace terminal; headless workaround = git bundle → push from Mac
  (that's how the snapshot landed: c7f56c8). Codespace clone was reset to match and will
  fast-forward next authed session.

- **PRs SUBMITTED**: Cotal-AI/Cotal **#254** (connector-codex) + **#255** (connector-agy),
  Jul 19 ~18:00 UTC on Wally's go. CI awaits maintainer workflow-approval (first-time
  contributor) — check `gh pr checks 254/255 --repo Cotal-AI/Cotal`. Overview site,
  README, and drafts all show live PR links (site redeployed, zip badge verified).
- **Repo PUBLIC**: github.com/Wally-Ahmed/agi-summit-hack (Jul 20; tree + full history
  secret-scanned clean first). Fork was already public.
- **Codespace claude-mem INSTALLED + BACKFILLED (Jul 20–21)**: plugin
  `claude-mem@thedotmack` v13.11.0 (Mac stays on 12.4.7 — independent DBs, harmless),
  Bun 1.3.14 runtime, worker on :37700 using the Codespace's own Claude OAuth. All 7
  pre-install sessions (5 workspace + 2 hh-e2e — ALL mesh-worker transcripts, zero human
  prompts) were backfilled via a hand-authored `claude-code-backfill` transcript-watcher
  schema (cotal channel injections mapped as prompts; `message.content.0.*` tool events;
  watcher must run IN-PROCESS in the worker — default config path — because
  `ingestObservation` is worker-context-only; summaries fired manually via
  `POST /api/sessions/summarize`). Result: **14 observations + 7 summaries + 37 prompts**
  across projects agi-summit-hack / hh-e2e; timestamps = ingestion time (Jul 21), not
  original session dates. Verified end-to-end: fresh `claude -p` on the Codespace receives
  the context block and quotes backfilled titles. Watcher config/state + ~/backfill-stage
  REMOVED after (live capture = native hooks only; 11 benchmark /tmp transcripts
  deliberately excluded as noise). Pre-backfill backup:
  `~/codespace-claudemem-backup-20260720-backfill.tgz` (Codespace) + same name on Mac
  `~/Desktop`. Full recipe: memory `codespace-claude-mem.md`.
- **NOT pursued**: separate GitHub repos for the codex/agy↔OpenRouter wiring — Wally
  dropped it once clear both hosts just use the already-public
  `Wally-Ahmed/openrouter-subagents` (loose end: Mac's `gpt-subagents-subscription`
  clone is 1 commit ahead of origin — a `git push` would sync it).

## Previous checkpoint — PR-STANDARDS PASS COMPLETE (Jul 19 ~17:30 UTC)

**PR state: SENT Jul 19 ~18:00 UTC on Wally's go — #254 (codex) + #255 (agy),
https://github.com/Cotal-AI/Cotal/pull/254 + /pull/255. CI awaits maintainer
workflow-approval (first-time contributor). Post-verification passed first: bundle-diff
old-JS vs new-TS (index byte-identical; serve residual = only intended cosmetic changes),
buildLaunch happy+fail-loud exercises, serve no-identity guards.**
Both fork branches ported to TypeScript matching the sibling-connector contract and
force-pushed: `add-connector-codex` @ c155292d, `add-connector-agy` @ aa718a52, each ONE
squashed commit. Verified per branch on the Codespace clone (/workspaces/Cotal):
filter-build, per-package `typecheck`, esm import smoke, `pack --dry-run`, and
`pnpm install --frozen-lockfile` (the CI unit-job gate; the agy branch was MISSING its
lockfile importer — found and fixed here). Also added both packages to the changesets
`fixed` group. Submit commands + bodies: `docs/cotal-pr-drafts.md` →
`docs/pr-body-codex.md` / `docs/pr-body-agy.md` (attribution footers strippable).
CI facts learned: unit job runs `pnpm typecheck` (recursive) + build + `pack --dry-run`
on the claude connector; smokes/live don't touch new connectors.

**Submission state (everything else is DONE):**
- Site LIVE: https://hermes-handoff-overview.fly.dev/ — 3 tabs, 18-scene narrated
  walkthrough (benchmarks = 10 scenes @ 2:23–6:37, PR tab scene @ 1:33), per-slide
  explainer panel, auto-scroll + sticky media strip, project-zip download badge.
  Redeploy: `bash deploy/overview/stage.sh && (cd deploy/overview && fly deploy)`.
- Pre-recorded walkthrough MP4 (6:57, 42MB, sync-verified): `~/Desktop/
  walkthrough-recording.mp4` (+ recipe in /tmp/walkrec; NOT in git). Offer: host on fly.
- README.md + DEMO.md rewritten product-first for submission.
- 10 benchmark studies published incl. run 8 failover (no autonomous reclaim + autopsy)
  and run 9/10; raw jsonl evidence committed; effort ceilings corrected (runner pins max).
- hermes-handoff E2E PASSED (wizard→OAuth brain on ChatGPT sub→claude worker→deliverable).
  Live space at /tmp/hh-e2e on the Codespace (planner+worker3 idle; `worker` was killed in
  run 8 — respawn with `cd /tmp/hh-e2e && cotal spawn worker --detach` when needed).
- Auth: codex + hermes openai-codex OAuth both restored (device flow; ChatGPT security
  toggle now ON). Mac gpt-subagents-subscription MCP still needs Wally's `npm run login`.
- Remaining: ~~Wally fires the 2 PRs~~ DONE (#254/#255, see top block); optional
  routing-policy study (~1h) if he wants an 11th before the deadline.

## Previous pivot checkpoint (Jul 19 ~12:30 UTC)

**Wally's strategic reframe (verbatim intent):** the mesh demo reads as a Cotal
proof-of-concept, not a standalone project; nobody runs 3 harnesses at once. New product:
an installable **Hermes tool** that walks you through choosing ONE harness (Claude Code,
Codex, Antigravity, + Claude Cowork as a target) and wires a workflow where Hermes hands
tasks — ANY tasks, not just coding — to that harness. Value prop = **model gating**:
gpt-5.6-sol is gated to Codex/ChatGPT, Gemini 3.1 Pro (High) to Antigravity, Opus/Fable to
Claude Code/Max; the tool is the legitimate front-door to whichever gated model your
subscription covers. Cowork research (Jul 19): NO headless API; `claude://cowork/new?q=…&folder=…`
deep links exist but always require a human confirmation dialog → Cowork = *attended*
handoff tier, the other three are autonomous. Design discussion with Wally in progress —
see the session for the open questions (submission framing vs Cotal prize; Cowork scope).

**LATEST (Jul 19 ~09:20 UTC): product E2E PASSED · run 8 PUBLISHED · all auth restored.**
- Codex re-login done (device flow; ChatGPT security toggle now ON). Hermes OAuth done:
  pooled credential `openai-codex-oauth-1`, model (auto) → planner brain rides the ChatGPT
  sub at $0. gpt-subagents-subscription MCP on the Mac still needs Wally's `npm run login`.
- **hermes-handoff END-TO-END PASS** on the Codespace: `init --harness claude --brain
  codex-oauth` → `up` (mesh + seeded planner + claude worker) → `ask` → HELLO WORLD on
  disk. Live space at /tmp/hh-e2e (cotal cmds must run from there, not the repo).
- **Run 8 failover PUBLISHED** (RESULTS.md): 3 attempts (bystander kill / planner kill via
  matcher bug — both fixed in run-failover.sh / clean kill) → **no autonomous reclaim**,
  planner store shows zero post-kill messages; no task lifecycle → no wake. Bonus: planner
  independently verifies completed work. Overview: run-8 slide + explainer + scene18.
- Runner now pins TRUE effort ceilings (codex max / claude --effort max session flag);
  runs 1–10 ran xhigh everywhere (relabelled honestly).

**Pivot execution status (this session):**
- `tools/hermes-handoff/` BUILT + wizard smoke-tested on the Codespace (detect/pick/personas/
  config all pass; full `up` launch untested — needs a planner brain: `hermes login` OAuth
  or OpenRouter top-up). Brain step supports codex-oauth / nous / openrouter.
- **Two Cotal upstream PRs PREPARED, NOT submitted** (Wally fires): fork `Wally-Ahmed/Cotal`,
  branches `add-connector-codex` + `add-connector-agy`, both build in-tree vs connector-core
  0.12.0 and import clean. PR bodies + submit commands: `docs/cotal-pr-drafts.md`.
- **overview.html REFRAMED @ 2548dd8**: hermes-handoff product panel + wizard flow (top of
  project tab, inspector entries w1–w4/wizard), runs 9/10 slides, upstream-PR ribbon/cards,
  tour now 14 scenes (new mp3s 12/13/14; scenes 4/8 re-recorded for PR beat + new finale),
  play button fixed top-right, slider arrows moved into the dots timeline (Wally's asks).
  Render-verified via playwright (only favicon 404).

**AUTH INCIDENT (Jul 19 ~08:25 UTC):** Wally disconnected all Codex sessions in ChatGPT
Security Settings (while enabling device-code auth). EVERY Sign-in-with-ChatGPT OAuth was
revoked: Codespace codex (`token_revoked` on live probe; auth.json cleared), the Mac's
gpt-subagents-subscription MCP (`token_invalidated` — revive with `npm run login` in its
repo), likely his Mac codex too. NOT affected: ChatGPT web logins, API-key MCP servers,
Claude Max, agy Google. Re-login in progress via `codex login --device-auth` on the
Codespace — the device endpoint 429'd repeatedly (a leftover hermes device-flow poller had
rate-limited it; killed), retrying with long backoff. After codex is back: rerun a
codex-sub live probe, then `hermes auth add openai-codex --type oauth` (device flow now
enabled account-side) for the planner brain, seeded into the connector HERMES_HOME by
hermes-handoff's `up`.

**Benchmark v4 status (this session, published @ 2866bbd):**
1. **Run 9 DONE** — t12-reasoning + t13-hallucination authored, validated
   (virgin-fail/ref-pass), run hermetically: 6/6 across claude/codex-sub/agy, ZERO
   hallucinated traps anywhere; agy tops a table for the first time (49s).
2. **Run 10 DONE** — cost per verified task: Opus ~$0.51/PASS vs Gemini ~$0.14/PASS
   metered; subscription arms ≈ $0 marginal. Plus the idle-burn finding (below).
3. **Run 8 (failover) BLOCKED** — `benchmark/run-failover.sh` is written and committed, but
   the **wedged planner drained ~$4 of OpenRouter credit overnight** (hermes `skill_manage`
   loop, "working" for hours, sessions show total_tokens 0 once broke). Balance now ~$0.68 —
   planner brain can't complete a call. Needs top-up, then: respawn planner
   (`cotal spawn planner --agent hermes --detach`), verify READY probe, run the script.
   Mesh state: manager + worker-2 (claude) UP·idle; planner STOPPED (burn control);
   worker3 STOPPED (agy arm mcp_config conflict; clean respawn documented in v4 plan).
2. **overview.html is the crown jewel** — narrated walkthrough (11 ElevenLabs scenes),
   in-panel media strip (aids, never replaces the live choreography), labeled Gemini-3-Pro
   stills + 8 Veo clips (all 8 scenes verified good after scene1/scene6 retries — retries
   extracted locally, commit if not yet), connector-status ribbon, hero banner REMOVED.
   Visual rules in memory: diagram-like with real labels/numbers, never ethereal,
   visuals complement the narration beat.
3. Cotal's own codex connector EXISTS but is a pull-only 123-LOC experiment on
   connector-core 0.2.0 (mesh can't wake it) — verified on npm; our pitch acknowledges it
   (README, ribbon, scene-4 narration). Don't overclaim "didn't exist."
4. OpenRouter: HAS video models (query `?output_modalities=video`; async POST /api/v1/videos,
   frame_images first-frame anchoring, ~$0.32/clip veo-3.1-fast; gemini-3-pro-image for
   labeled stills ~$0.11). Credits ~$4.70 — top up before big media passes.
5. Then: runs 8/9/10 published → slides + walkthrough scene if warranted → final sweep.

## Previous state (still true)

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
   **LIVE TEST PASSED (2026-07-19 ~04:07 UTC, session resume) — connector fully verified:**
   spawn joined mesh (`worker3/builder agy·pty`), cotal entry merged into mcp_config alongside
   the preserved subagent entries, DM round-trip produced `worker3 → #general: AGY WORKER OK`
   (captured live in `cotal console --plain` — which DOES stream channel messages, contrary
   to the earlier membership-only note), multi-turn resume held context (no fail-loud), stop
   → worker offline + cotal entry removed cleanly. Both open assumptions verified: headless
   `--conversation` resume works; agy accepts streamable-HTTP `serverUrl`. THREE connectors
   now proven: hermes (planner), codex (worker2), agy (worker3).
2. **codex-sub arms DONE (Jul 19 ~04:30 UTC) — run 5 published.** Wally did a FRESH browser
   login on the Codespace (port-1455 forward; device-auth was disabled on his ChatGPT account;
   Mac token never reused — his rule, in memory). Native model = **gpt-5.6-sol** @ xhigh:
   7/7, easy 100s / hard 344s vs Claude Code on Max 79s/234s — **latency story inverts on
   native subscriptions; backend+model dominates harness overhead.** Snapshots
   `hermetic-codexsub-{easy,hard}.jsonl`. Forward + login server torn down after.
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


---

## CHECKPOINT 8 — 2026-07-24 ~00:45Z (issue-#286 investigation + fix PR build in flight)

**Site (live, verified):** `c913411` #v04gap corroboration (issue #286 + "v0.14.0 closed none of the four gaps"); `9a954e0` new `#layers` section (Cotal mesh-of-harnesses vs our MCP servers; OpenRouter reach incl. no-harness + image/video models). Build stamp verified live both times. 26 scenes unchanged — MP4 stays valid; #layers has NO walkthrough scene (Wally may want a re-record later). QUEUED small wording fix: box-④ corroboration says "the same presence gap" → should be "a sibling gap" (see below).

**Upstream state (Jul 22-23):** v0.14.0 released (W3/W4 security campaign) — connector diff = version bumps only; all four #v04gap gaps SURVIVE. Our PRs #254/#255 untouched (no reviews, CI never run). New upstream: issue #286 (stale presence, NomadaDigital01), PR #288 (copilot fix attempt, ZERO code), PR #285 (control surface v0.4, open — disjoint from our fix files), PR #289 (community quorum example on v0.4 endpoints).

**#286 investigation VERDICT (3 agents deep):** version skew REFUTED (every published core 0.1.0→0.14.0 has all presence protections; bucket TTL 6s in every commit ever). Serve-pid orphan REFUTED (POSIX npm = hardlinked native binary, exec chain). REAL mechanism = two connector bugs + display gap: **A1** stale activity survives into idle (agent.ts:766-770 setStatus only sets activity when defined; plugin.ts safeStatus("idle") bare; retry text from plugin.ts:428-430) · **A2** SIGKILL'd serve SHIM orphans `opencode serve` whose embedded plugin heartbeats forever (shim handles only SIGINT/SIGTERM; manager hard-stop SIGKILLs via pty.ts:127,133) · **B** CLI shows retained activity unqualified next to offline. Our own 0.12.0 zombies = same bugs, NOT version skew. Our box-④ "offline dies one subscription short" claim CONFIRMED separately (connector-core subscribes only message/error/connection). Evidence clones under /tmp: cotal-presence-scope (unshallowed), core-0120-check, core-010-check, conn-oc-check, natskv-check, oc-orphan-test.

**Fix PR (Wally-approved scope A1+A2+B):** builder agent running on /tmp/cotal-fix-286 (fork clone, branch fix/286-dead-agents-go-dark off upstream/main). TDD red→green, their gates, changeset, PR_DRAFT.md. NO PUSH — Wally fires submission after reviewing diff. #254/#255 branches strictly untouched.

**Codespace:** read-only ruling enforced (mission cancelled pre-launch by permission layer — correctly). Vitals delivered: fable-5 stamped, ctx 61,728/1M ≈ 6.2% (FABLE 5 = 1M WINDOW — verified docs; never assume 200k), workerc resumed in place, mesh agents ran main-loop only (task DM forbade delegation; sibling dirs = tool-results only). Repo there is 26 commits behind + dirty with already-upstreamed Run 11 edits → future sync = stash/reset, NOT merge. Creds expired (24h rot). **NEW standing prefs: effortLevel MAX (was xhigh; settings.json updated + smoke-verified) and future codespace work starts NEW sessions, not resumes.**

**Next:** builder report → I verify gates+diff myself → show Wally → he fires PR → then site wording fix + RESULTS/memory updates batch (cotal-failover-gap.md needs the presence-mechanism correction).
**STANDING RULE (2026-07-24, Wally verbatim): NO `fly deploy` without his direct say-so — every deploy, forever. GitHub commits/pushes fine; stop at the deploy step and ask. The queued site wording fix therefore ends at commit+stage until he green-lights the deploy.**
**Site workflow refinement (Wally, same date): edit → serve on LOCALHOST for his review (http.server 8902 rig) → his approval → only then fly deploy.**
**PARKED (Wally, 2026-07-24): the 4K walkthrough MP4 on his Desktop is STILL BOTCHED (defect unspecified) — do NOT treat it as final or claim it's fine; revisit when he brings it back. Any re-record happens AFTER the viewport/fullscreen fix lands, at the fixed geometry.**


---

## CHECKPOINT 9 — 2026-07-24 ~03:4xZ (fix-286 internal-review stretch, mid-flight; goal = /goal Stop-hook active)

**Site DEPLOYED (Wally-approved): build 7de394e live** — viewport/fullscreen fix (db41161: fullscreen on tour start + short-viewport clamps + measured scroll clamp) + media-keys (7de394e: Media Session play/pause/prev/next; pause suspends the 9s fallback). Byte-verified. New standing rules recorded earlier: NO fly deploy without direct approval; localhost review first (http.server 8902 rig, currently pid 69282 serving repo root).

**16:9 preview MP4 delivered** (Desktop walkthrough-16x9-preview-1080p.mp4, take 3): recorder needed TWO fixes — (a) headless grants gestureless fullscreen and resizes to fake 800×600 screen → quarter-frame; fix = stub requestFullscreen + declare screen metrics (documented in walkthrough-builder skill references/recording.md); (b) one-off scene-20 'ended' stall → 90s watchdog dispatches ended event. VISUAL frame QC now mandatory before delivery. 4K MP4 still parked-botched per Wally.

**#286 fix — internal review (artifact /tmp/cotal-fix-286 @ 265231c2, UNTOUCHED; base d1275701 = upstream tip):**
Internal review rounds (evidence LOCAL ONLY at /tmp/cotal-fix-286-audit/ — not public material) surfaced and settled, so far:
- A proposed ESRCH-narrowing was adjudicated HARMFUL and rejected — **EPERM-means-dead stands as correct**.
- **nc.drain() at endpoint.ts:1092 is deadline-free (nats.js source-verified) → minutes-scale shutdown wedge** — confirmed real (an early refutation of it was itself overturned).
- The cited "manager group-kill" mitigation is NOT in code (future work — PR wording must say proposed).
- Both core bugs re-derived under independent verification: **EPIPE dead-pipe kill** (proven Node+bun 3/3) + the **drain wedge**.
- NEW: **F5 session-adoption leak** (adoptSession plugin.ts:217-235 never clears presence → mid-turn /new strands stale activity; 1-line fix) + zombie false-fail risk in our smoke check 6 + #285 root-package.json conflict confirmed live.
- One further independent review pass still RUNNING at checkpoint time.

**Accumulated fix-first batch (frozen until internal-review sign-off):** 7 pre-validated items (ANSI \x1b regex + discrimination test; shim-orphan header truth; deliberate-catch comment; relativeTime finite guard; unref bun comment; smoke rename smoke:opencode-idle-activity; PR-draft out-of-scope bullet render.ts/join.ts/Roster.tsx) + stderr error-handler EPIPE fix (try/catch provably wrong) + observed-offline smoke assertion split + bounded shutdown tail (unref'd hard-exit timer) + later-review candidates (F5 adoption clear, zombie-tolerant check 6, assertion-style unification, respawn smoke step, status.ts pinning, PR-draft group-kill=proposed wording + #285 rebase note). Trailers must be stripped on amend.

**GOAL (Stop-hook): internal review completes → remaining findings reconciled → polish wave → all gates green → post-polish verification round (iterate) → STOP and present diff+PR body+gates+review sign-off to Wally for send-it. NO branch push, NO PR, #254/#255 untouched until his word.**
**COMPACTION PREP (cp9 addendum): all internal-review reports extracted verbatim to /tmp/cotal-fix-286-audit/ (LOCAL ONLY; MANIFEST.md there carries the full adjudication item list). Later review steps should READ THE FILES, not rely on conversational memory. The outstanding review pass (agent a0c23d5539c23822b) was still running at persist time; its notification resumes the /goal workflow at step 1→2.**


---

## CHECKPOINT 10 — 2026-07-24 ~04:1xZ (compaction prep #2; two agents in flight)

**In flight at compaction:**
1. **Outstanding independent review pass** (agent a0c23d5539c23822b, re-reviewing untouched 265231c2 end-to-end). Its completion resumes the /goal workflow: reconcile all internal-review findings (read /tmp/cotal-fix-286-audit/MANIFEST.md + the report files there — LOCAL ONLY; file the new report there first) → polish wave → post-polish verification round → STOP at Wally's PR gate. Goal text = HANDOFF cp9 + active /goal Stop-hook.
2. **Walkthrough scenes 27-28 builder** (agent a3774263dd06f1267). Wally APPROVED both scenes + verbatim narrations (AskUserQuestion: "Approve — build both"). Specs: n:27 inserted directly AFTER the n:19 TOUR entry, cap "**Two layers, one project** — Cotal meshes harnesses · our MCP servers reach any model", foc #layers fb start, no vis; n:28 directly AFTER n:25 (before n:22 finale), cap "**Corroborated upstream** — issue #286 · filed hours after this page went live", foc #v04gap fb center, no vis. TTS: ElevenLabs voice DbwWo4rVEd5NrejHYUnm, mp3s walkthrough/scene{27,28}.mp3, STT-verify "two hundred eighty six"/"zero point fourteen"/"image and video models". Ends at COMMIT — NO deploy (localhost review → Wally's deploy word). Tour 26→28; stage.sh count is dynamic; EXPLAIN untouched.
   **Narration 27 (verbatim, approved):** "Before the numbers, one distinction. Cotal connects harnesses — whole agent products, each a separate process with an identity on the mesh. Our MCP servers work one layer deeper: they inject models straight into a single agent's loop. And the OpenRouter server reaches where a mesh structurally can't: any model in the catalog becomes a subagent — including models no harness wraps at all, and even the image and video models you normally only touch through an app or a web page. Two layers, complementary — and this project shipped both."
   **Narration 28 (verbatim, approved):** "And the gap did not stay ours alone. Hours after this page went live, a community user filed issue two hundred eighty six: dead agents lingering on the roster, looking alive — quote — indefinitely, masking that they died. GitHub's Copilot agent attempted a fix the same evening, and shipped zero code. Version zero point fourteen arrived — and closed none of the four gaps. So we went after it ourselves: traced the ghost to real bugs in the connector, proved them on both runtimes, and built the fix for the Cotal team."

**Both MP4s now 26-scene-stale by design** (4K parked-botched + 16:9 preview take-3 delivered). **MP4 RE-RECORD IS USER-GATED (Wally, 2026-07-24): do NOT re-record ANY walkthrough MP4 until he explicitly says to** — scenes 27-28 landing or the internal review settling does NOT trigger it. Recorder rig /tmp/walkrec1080/record.mjs carries the fullscreen-stub + screen-metrics + 90s stall-watchdog fixes (also documented in the walkthrough-builder skill).

**Standing gates unchanged:** no fly deploy without Wally's word (localhost first) · no branch push/PR/upstream comments until send-it · #254/#255 untouched · never Fable via OpenRouter · gpt-subagents-subscription MCP re-authed 2026-07-24 (login gotcha: 5-min listener timeout, one-tab state hygiene; ~15-min stream cap — split large asks).

---

**ADDENDUM (2026-07-24, post-cp10):** Scenes 27-28 LANDED — commit `5ba2413` (overview.html +2
TOUR lines; walkthrough/scene27.mp3 32.4s, scene28.mp3 39.9s; tour 26→28; play idx 9 = n:27,
idx 26 = n:28). Independently verified: STT clean, geometry clears the caption band at 16:9,
live fly.dev site UNTOUCHED (no deploy — awaiting Wally's localhost:8902 review then his deploy
word; MP4 recording separately user-gated). **Scene-28 narration carries ONE closing sentence
beyond cp10's "verbatim" text** ("And the four gaps that remain? We're closing those for them
too — a fix is in the works as we speak.") — **Wally-approved: he steered the builder directly
in its loop.** Such direct injections are NOT persisted in any transcript (verified); never
treat transcript absence as proof a subagent invented an instruction (memory:
subagent-loop-steering; a wrong fabrication accusation was made and retracted over this).
Builder also surfaced a PRE-EXISTING engine race (jumping away from a media scene mid-load lets
a stale onload re-show the strip) — unfixed, follow-up candidate. REVIEW SIDE: the outstanding
independent review pass landed (report LOCAL ONLY in /tmp/cotal-fix-286-audit/). It re-derived
EPIPE with instrumented real-plugin proof (FIX-FIRST) and flagged a "publishes offline" wording
overclaim; NEW FA-2 sibling-connector leak sites claude-code mcp.ts:65,100 + hermes
hermes-hooks.ts:34,49; FA-5 reentrancy reopened; FA-6 drain severity recalibrated; F5 still
single-source. Review evidence updated; findings not yet fully reconciled → final adjudication
review round RUNNING (log local). On its report: verify → polish wave → post-polish
verification round → STOP at Wally's PR gate.

---

**ADDENDUM (2026-07-25): /goal steps 2-3 COMPLETE.** Usage-limit crash mid-review recovered
losslessly (crash-safe logging; no findings lost). Internal review closed with full agreement,
no open flags (log LOCAL ONLY in /tmp/cotal-fix-286-audit/). Polish wave EXECUTED:
/tmp/cotal-fix-286 amended 265231c2 → **b03d3f6c** (single commit on d1275701, subject kept,
trailers stripped, 8 files +153/−36; all gates green; red-green EPIPE/ANSI/adoption; C2
re-earned on real opencode-ai 1.18.4 — offline PUBLISHED; report local; NOT
pushed). Notable: the review's ANSI "vacuous assert" premise was WRONG (committed regex held a
raw 0x1b byte; the probe read a retyped copy) — shipped fix still strictly better; the
post-polish verification round must adjudicate. Site side: scenes 27-28 got dynamic visuals +
popup float mode (644827d, localhost-reviewable, NOT deployed). NEXT: step 4 post-polish
verification round → step 6 STOP at Wally's PR gate. Conductor Rule now in CLAUDE.md.

---

**CHECKPOINT 11 (2026-07-25): /goal COMPLETE THROUGH STEP 5 — STOPPED AT WALLY'S PR GATE.**
Post-polish verification round: **CLEAN-TO-SHIP, explicitly ratified** (internal-review log
LOCAL ONLY in /tmp/cotal-fix-286-audit/). Rider R1 applied (PR_DRAFT.md:53 dispose-claim
dropped — ratified zero-churn); R2 (plugin.ts:51-52 comment same fix) folds into next
sanctioned amend ONLY; register item: doctor-auth.smoke.ts:101 upstream raw-0x1b idiom
(out-of-PR). Artifact FINAL: /tmp/cotal-fix-286 @ **b03d3f6c** on d1275701, single commit,
trailers stripped, tree clean (+untracked PR_DRAFT.md with R1). Final diff exported
/tmp/fix286-final.diff (12 files +687/−9); PR body /tmp/fix286-pr-body.md. All gates green
(report local); C2 re-earned on real opencode-ai 1.18.4. Notable review self-correction: ANSI
"vacuous assert" premise was a tooling artifact (raw 0x1b in the committed blob), formally
retracted; shipped visible-escape form ratified. AWAITING: Wally's "send it" → push branch to
Wally-Ahmed/Cotal fork + open PR against
Cotal-AI/Cotal (title = commit subject; body = PR_DRAFT.md). #254/#255 untouched (both still
OPEN, unreviewed, only our own Jul-22 rebase comments). Walkthrough thread (parallel): tour 30
scenes; #layers de-duplicated (328d3c4 — popup is sole schematic carrier); animation agent
rebuilding scenes 27-30 mp4s (virtual-time capture, motion-proof gate) still in flight; deploy +
MP4 re-record remain user-gated.

---

**CHECKPOINT 12 (2026-07-24 — compaction prep).**

**GIT HISTORY PURGE — DONE + VERIFIED (git-filter-repo).** Internal-notes doc removed from ALL
commits; every historical HANDOFF.md version dropped, current scrubbed copy re-committed fresh
(history now shows HANDOFF in exactly 1 commit); leaky commit-message terms redacted. Force-pushed:
origin/main = **2ad4d95** (local realigned, matches). Fresh-clone verified: 0 leaky messages, 0
internal-doc paths, 1 clean HANDOFF, working HANDOFF grep 0. Pre-purge backup bundle:
`~/Desktop/agi-summit-hack-prepurge-20260724-0151.bundle` (contains the secret — keep private).
STILL OWED to Wally: GitHub may retain orphaned commits by SHA post-force-push → give him the
support ask (repo GC / dissociate) to guarantee eviction.

**⚠️ TRADE SECRET STILL LIVE ON THE SITE.** hermes-handoff-overview.fly.dev's project zip serves
the OLD pre-purge HEAD → still contains the internal-notes doc + old HANDOFF. Wally ORDERED the
zip purge (a deploy) and it is GRANTED, but I paused before running it. **Task #32 (pending):
stage.sh + fly deploy from purged HEAD, then download the live zip and prove the secret is absent
+ byte-verify page + build stamp (31 scenes).** This deploy is the ONE exception to the standing
fly-deploy gate — Wally explicitly ordered it. Run it on resume unless he says otherwise.

**WALKTHROUGH — 31 scenes, all animated, results-only framing (process is [[trade-secret-rule]]).**
Latest local+pushed tip before purge realign was the walkthrough work; after purge, origin/main
2ad4d95 contains ALL of it. Scenes 27-30 videos rebuilt as REAL animation (virtual-time WAAPI
capture, ≥92% motion-gate; skill's references/scene-videos.md now documents this as the default,
"still-slideshows rejected"). Scene 31 "The bug list, in detail" + #dd286ledger row (5 bugs→5
fixes) added; scene 29 re-recut to drop process wording. Explicit SHIM DISAMBIGUATION added
(commit was eff72a1, now in purged history): #deepdive286 opens with a "Not our shim" note — the
#286 shim = the **opencode connector's own launcher (upstream Cotal code)**, ephemeral over a
persistent `opencode serve`; OUR connectors' shim (push-by-respawn panel) = the always-on process
WE built that owns mesh identity. Mirror tag in the our-shim panel. NOT deployed (see task #32).
Both MP4s still user-gated ([[mp4-rerecord-gate]]); no re-record.

**#286 FIX — FROZEN at b03d3f6c, AWAITING WALLY'S "CHANGES FIRST".** /tmp/cotal-fix-286, branch
fix/286-dead-agents-go-dark, single commit b03d3f6c on d1275701, CLEAN-TO-SHIP (all gates green,
red-green proven, real-binary re-earned; internal review closed with full agreement — evidence
LOCAL ONLY /tmp/cotal-fix-286-audit/). Final diff /tmp/fix286-final.diff (12 files +687/−9), PR
body /tmp/fix286-pr-body.md (rider R1 applied). At the step-6 PR gate Wally answered **"Changes
first"** then **"Hold — changes coming"** — he has NOT yet specified the changes. DO NOT push the
branch / open the PR / comment upstream until he gives the edits AND says send it. #254/#255 stay
untouched.

**UPSTREAM COTAL CHECK (2026-07-24, this session).** main moved d1275701 → **6b765957** (8 commits,
today): @cotal-ai/core **0.13.x → 0.14.2** (changeset releases #291/#293), Node-22 preflight (#292:
bin/cotal.ts, bin/run.ts), repeat-global-install fix (#290: cli/src/commands/setup.ts,
cli/src/lib/nats-bin.ts), docs. **NONE of our fix's SOURCE files touched** (plugin.ts, serve.ts,
endpoints.ts, status.ts, ui.ts, offline-display smoke all clean) — zero code conflict. BUT every
package.json got version-bumped to 0.14.2 + connector-opencode/CHANGELOG.md → our branch now needs
a REBASE for version numbers + pnpm-lock + our changeset, BROADER than the #285 smoke:ci note
already in the draft. Issue/PR status UNCHANGED: **#286 still OPEN** (unfixed upstream), #288 still
OPEN/paused-zero-code, #285 OPEN, #254/#255 OPEN & unreviewed. So our fix is still needed and still
lands clean on code; flag the 0.14.2 rebase to Wally as a likely "changes-first" item.

**Task list live:** #29 ✓ #30 ✓ #31 ✓ (purge) · #32 PENDING (zip-purge deploy, granted). Conductor
Rule in CLAUDE.md; all change-work via subagents; results-only public content; local memory holds
[[trade-secret-rule]], [[orchestrator-enforcement]], [[subagent-loop-steering]], [[mp4-rerecord-gate]].
