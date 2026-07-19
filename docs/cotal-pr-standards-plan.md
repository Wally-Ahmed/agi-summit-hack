# PR-standards pass — bring our connectors up to Cotal-team code standards BEFORE sending

Wally's directive (Jul 19): do NOT send the two PRs yet. First investigate the Cotal
monorepo's patterns and upgrade `extensions/connector-codex` + `extensions/connector-agy`
on our fork branches to match. Then he fires the PRs.

## Where everything is

- Fork clone: Codespace `/workspaces/Cotal` (branches `add-connector-codex`,
  `add-connector-agy`; both pushed to `Wally-Ahmed/Cotal`). Both currently BUILD in-tree
  (`pnpm --filter "@cotal-ai/connector-<x>..." run build`) and import clean.
- PR bodies + submit commands: `docs/cotal-pr-drafts.md` (update if code changes).
- Our sources came from `connectors/cotal-connector-{codex,agy}` in this repo (JS).

## What to investigate (in the monorepo)

1. **Their meta/standards docs**: root `AGENTS.md`, `CLAUDE.md`, `SPEC.md`,
   `LICENSING.md`, `NOTICE` — read for stated conventions; there is NO CONTRIBUTING.md.
2. **CI gates**: `.github/workflows/` — what must pass (build? typecheck? lint? tests?).
   Match whatever the pipeline enforces or the PR bounces.
3. **The sibling connectors as style reference**: `extensions/connector-claude-code`
   (closest analog) and `extensions/connector-hermes`, plus `extensions/connector-core`
   (the API we consume). Compare: language, file layout, naming, error handling, logging,
   how they structure the MeshAgent lifecycle.
4. **Package.json contract**: theirs have `"types"`, `typecheck` script
   (`tsc -p tsconfig.json --noEmit`), `build` = rm dist + `tsc --emitDeclarationOnly` +
   esbuild bundle, `files` whitelist, Apache-2.0, `repository.directory`. Ours (known
   gaps): **plain JS, no tsconfig, no typecheck, no types field, no tests**.

## Expected work items (verify against findings before doing)

- [ ] Port `src/*.js` → TypeScript matching connector-claude-code idiom; tsconfig
      extending `../../tsconfig.base.json`; `types` + declaration emit in build.
- [ ] Add `typecheck` script; make it pass; wire `files` whitelist.
- [ ] Align naming/log style/error surfaces with connector-core patterns.
- [ ] Tests if (and only if) sibling connectors have them / CI runs them.
- [ ] Rebuild + re-verify import; update PR drafts if interfaces moved; force-push
      branches.
- [ ] Re-run one live smoke per connector from the in-tree build if feasible (spawn on
      the hh-e2e space) — the PR claims live verification.

## Gotchas

- pnpm workspace: deps must stay `workspace:*`; build via
  `pnpm --filter "@cotal-ai/connector-<x>..." run build` (the `...` builds connector-core
  first — its dist/ is required).
- Codespace git identity for fork commits:
  `-c user.email=openbroker00@gmail.com -c user.name="Wally Ahmed"`.
- The Codespace token cannot push to the fork — bundle branches out
  (`git bundle create` → `gh codespace ssh -- cat` with gzip-magic strip if needed) and
  push from the Mac (its gh auth owns the fork).
