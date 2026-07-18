# CLAUDE.md

## Token Usage Rules

Keep context small. Do not read the whole repo unless necessary. This whole pattern applies for all subagents too.

Before broad file search or opening many files:

1. Check Graphify outputs first.
2. Use MemPalace only when prior project decisions or past context may matter.
3. Open only the files needed for the current task.
4. Prefer targeted reads over large scans.
5. Summarize findings before continuing to more files.

## Graphify Usage

Use Graphify as the first-pass repo map. This whole pattern applies for all subagents too.

Before architecture work, refactors, dependency tracing, or “where is this implemented?” tasks:

* Check `graphify-out/GRAPH_REPORT.md` if it exists.
* Use the graph report to identify relevant modules/files.
* Use Graphify findings to reduce unnecessary file reads.
* Only fall back to broad search when the graph report is missing, stale, or insufficient.

Graphify is for codebase structure, relationships, and missed connections.

## MemPalace Usage

Use MemPalace for long-term project memory. This whole pattern applies for all subagents too.

Use it when:

* the user says we discussed something before
* prior architecture decisions matter
* the current task depends on earlier reasoning
* you need to recall previous plans, conventions, or implementation choices

Do not use MemPalace for every task. Do not treat recalled memory as automatically true. Verify against the current repo when needed.

### Revive MemPalace after every compact

The MemPalace MCP server (stdio) drops silently across long sessions and every `/compact` boundary —
its `mcp__plugin_mempalace_mempalace__*` tools then show as disconnected (no error, no data loss; the
palace and `mempalace.yaml` stay intact). **After every `/compact`, before relying on MemPalace,
verify its tools are connected; if they are not, prompt the user to run `/plugin` (or `/mcp`) to revive
it** (I cannot invoke those slash-commands myself). Expect this on each compaction. Until it is
reconnected, fall back to the file memory + Graphify.

## Working Style

For implementation tasks (This whole pattern applies for all subagents too) :

1. Identify the smallest relevant file set.
2. Explain the intended change briefly.
3. Make focused edits.
4. Run or suggest the narrowest useful test.
5. Avoid unnecessary rewrites.

For design tasks (This whole pattern applies for all subagents too):

1. Use Graphify for repo structure.
2. Use MemPalace for past decisions only if relevant.
3. Keep the answer concise and action-oriented.

## Project Rule

Optimize for low-token, high-signal work. Prefer precise context retrieval over loading large files or repeating architecture summaries.