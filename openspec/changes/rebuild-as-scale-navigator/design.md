# Design intent & open decisions

This document records intent and the decisions still open. No technology has been chosen. Specs under `specs/` are behavior-only.

## Mental model

```
 sources ──ingest──▶  INDEX (items, nested; edges; traces)  ◀──frame-scoped reads── agents
                          │                                         │ mine
                          ▼                                         ▼
                 VIEWFRAME = query + ladder + layout + entry scale   traces (sparkle / soapstone / strand)
                          │                                         │
                          ▼                                         ▼
                CANVAS (strategic zoom × infinite ZUI, cards in containment)
```

## Ladders (as viewframes)
| Ladder | Zoom steps (wide → fine) |
|---|---|
| Work | All → Project → Session → Episode → Turn → Tool call |
| Time | Year → Month → Week → Day → Session → Turn |
| Idea | Theme → Thread (across sessions/projects) → Session → Turn |

Work uses native structure. Time is cheap next. Idea needs derived threads. Episodes and threads are derived groupings, not part of the native tree.

## Source facts (Claude Code transcripts)
Facts about the first source, not decisions:
- Transcripts are per-session record streams grouped by project working directory.
- Each record has `uuid` and `parentUuid`, forming a tree that includes rewinds and branches.
- Records carry `sessionId`, `cwd`, `gitBranch`, `timestamp`, and `isSidechain` (subagent work).
- Message content parts are `text`, `thinking`, `tool_use`, `tool_result`.
- Sessions can grow while live.

## Open decisions (not yet made)

### 1. Storage and search engine
- Embedded relational store with built-in full-text search: simple, local, one file; ranking is basic.
- Plain files plus an in-memory index rebuilt at start: most inspectable; slow at scale.
- Dedicated search engine or vector-capable store: richer retrieval; heavier to run and install.

### 2. Embeddings: yes, no, or when
- Never: simplest, fully predictable; "same idea" detection stays lexical.
- Later, optional and local: enables Idea ladder and strands; adds model weight and re-index cost.
- From the start: semantic search immediately; couples early design to a model choice.

### 3. Layout engine
- Auto-pack (deterministic treemap-like): stable and legible; less organic.
- Force-directed: shows relatedness; jittery, unstable between sessions.
- Manual-sticky (machine proposes, user moves and pins): matches the hybrid decision; needs rules for re-layout around pins.

### 4. Rendering technology
- Canvas 2D: simple, fast for thousands of cards; text and accessibility need extra work.
- WebGL: scales to glow-level counts and effects; highest complexity, text rendering harder.
- DOM with CSS transforms: best text and accessibility; slows with many nodes.
- SVG: crisp at any scale; heavy beyond a few thousand elements.
(Hybrids, e.g. DOM for readable tiers and canvas/WebGL for far tiers, are possible.)

### 5. Are thinking blocks indexed?
- Excluded by default: privacy-safe, less noise; loses reasoning context.
- Indexed but hidden unless asked: searchable; risk of surprising exposure to agents.
- Indexed and shown like any text: simplest; weakest privacy posture.

### 6. Manual card moves: per-viewframe or global
- Per viewframe: each perspective keeps its own arrangement; moves don't carry between frames.
- Global per item: one arrangement everywhere; conflicts when layouts differ.
- Per viewframe with optional "promote to global": flexible; more concepts to explain.

### 7. First insight miner: on-demand or scheduled
- On-demand (user invokes an agent): explicit and cheap; no ambient surprises.
- Scheduled background: traces appear on their own; costs compute and needs stronger opt-in and decay controls.
- Both, on-demand first: staged; two paths to maintain.

### 8. How agents access the index
- Command-line interface: easy for any shell agent; coarse, per-call startup.
- Local HTTP interface: uniform for UI and agents; needs local auth to enforce grants.
- Tool-protocol server (MCP): native to agent tools; ties to that ecosystem.
(Grants must be enforced the same way whichever is chosen.)
