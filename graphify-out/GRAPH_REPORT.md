# Graph Report - .  (2026-07-18)

## Corpus Check
- Corpus is ~415 words - fits in a single context window. You may not need a graph.

## Summary
- 10 nodes · 14 edges · 4 communities (3 shown, 1 thin omitted)
- Extraction: 64% EXTRACTED · 36% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.87)
- Token cost: 36,304 input · 2,400 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Graphify Repo Mapping|Graphify Repo Mapping]]
- [[_COMMUNITY_MemPalace Memory|MemPalace Memory]]
- [[_COMMUNITY_Token Economy Rules|Token Economy Rules]]
- [[_COMMUNITY_Subagent Propagation|Subagent Propagation]]

## God Nodes (most connected - your core abstractions)
1. `Graphify` - 6 edges
2. `MemPalace` - 5 edges
3. `Token Usage Rules` - 3 edges
4. `Graphify Usage Policy` - 3 edges
5. `Working Style` - 3 edges
6. `Low-Token High-Signal Project Rule` - 3 edges
7. `graphify-out/GRAPH_REPORT.md` - 2 edges
8. `Revive MemPalace After Compact` - 2 edges
9. `MemPalace Usage Policy` - 1 edges
10. `Subagent Pattern Propagation` - 0 edges

## Surprising Connections (you probably didn't know these)
- `Graphify` --semantically_similar_to--> `MemPalace`  [INFERRED] [semantically similar]
  CLAUDE.md → CLAUDE.md  _Bridges community 0 → community 1_
- `Low-Token High-Signal Project Rule` --rationale_for--> `Graphify Usage Policy`  [INFERRED]
  CLAUDE.md → CLAUDE.md  _Bridges community 0 → community 2_
- `Token Usage Rules` --references--> `MemPalace`  [EXTRACTED]
  CLAUDE.md → CLAUDE.md  _Bridges community 2 → community 1_

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Policies Extended to All Subagents** — claude_subagent_pattern_propagation, claude_token_usage_rules, claude_graphify_usage, claude_mempalace_usage, claude_working_style [EXTRACTED 1.00]
- **Low-Token Context Retrieval Flow** — claude_token_usage_rules, claude_graphify, claude_mempalace [EXTRACTED 1.00]

## Communities (4 total, 1 thin omitted)

### Community 0 - "Graphify Repo Mapping"
Cohesion: 1.00
Nodes (3): graphify-out/GRAPH_REPORT.md, Graphify, Graphify Usage Policy

### Community 1 - "MemPalace Memory"
Cohesion: 0.67
Nodes (3): MemPalace, Revive MemPalace After Compact, MemPalace Usage Policy

### Community 2 - "Token Economy Rules"
Cohesion: 0.67
Nodes (3): Low-Token High-Signal Project Rule, Token Usage Rules, Working Style

## Knowledge Gaps
- **1 isolated node(s):** `Subagent Pattern Propagation`
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Graphify` connect `Graphify Repo Mapping` to `MemPalace Memory`, `Token Economy Rules`?**
  _High betweenness centrality (0.304) - this node is a cross-community bridge._
- **Why does `MemPalace` connect `MemPalace Memory` to `Graphify Repo Mapping`, `Token Economy Rules`?**
  _High betweenness centrality (0.243) - this node is a cross-community bridge._
- **Why does `Token Usage Rules` connect `Token Economy Rules` to `Graphify Repo Mapping`, `MemPalace Memory`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Graphify` (e.g. with `graphify-out/GRAPH_REPORT.md` and `MemPalace`) actually correct?**
  _`Graphify` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `MemPalace Usage Policy`, `Subagent Pattern Propagation` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._