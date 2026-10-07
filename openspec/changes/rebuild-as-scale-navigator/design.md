# Design: Scale navigator

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

## Index (packages/index)
- **Item**: `{id, source, kind, parent, title, text, created, updated, meta}`, a tree per source with cross-links as edges.
- **Claude Code adapter** reads `~/.claude/projects/<encoded-cwd>/<session>.jsonl`. Each record carries `uuid`/`parentUuid` (a tree that includes rewinds and branches), `sessionId`, `cwd`, `gitBranch`, `timestamp`, `isSidechain` (subagents), and content parts `text | thinking | tool_use | tool_result`.
  Native nesting: project (cwd) → session → turn (user prompt and everything until the next prompt) → step (assistant text, tool call/result).
  Episodes (task arcs within a session) and threads (ideas across sessions) are *derived* groupings, computed later and stored as edges, not baked into the tree.
- Storage: `node:sqlite` with FTS5. Incremental re-ingest keyed on file size and mtime, so appending to a live transcript only reads the tail.
- Query surface (used by viewframes and agents): a filter over source, kind, project, time range, text, and links, plus grouping by ladder.

## Ladders (as viewframe layouts)
| Ladder | Zoom steps (wide → fine) |
|---|---|
| Work | All → Project → Session → Episode → Turn → Tool call |
| Time | Year → Month → Week → Day → Session → Turn |
| Idea | Theme → Thread (across sessions/projects) → Session → Turn |

The first build ships the **Work** ladder (native structure). Time is cheap next; Idea needs the derived threads.

## Canvas (packages/canvas)
- Strategic zoom: each item has representations by screen size (full card → compact card → icon → glow/dot); the swap is continuous, not modal.
- Infinite ZUI: containment regions hold cards; a portal viewframe card holds a whole sub-world, so depth is unbounded.
- Regime HUD: the current regime's name and its verbs (Spore-style stage bar) and a powers-of-ten ladder you can click.
- Re-entry: a "where was I" trail of places, stored only in the browser.

## Membrane (packages/membrane)
- Grants: `agent → [viewframe ids]`. The agent API answers only within the union of granted frames.
- Beacons: explicit, timestamped `{location, message}`. An agent sees a beacon only if the location falls inside one of its frames.
- Traces written by agents: `sparkle {at}`, `soapstone {at, glyph-text}`, `strand {from, to, why}`. Each has decay; your engagement (reveal, appraise, traverse, keep) is the *only* feedback agents receive.
- No ghost cards: agents never place content-shaped things in your space.
- The insight layer is opt-in, globally and per agent.

## Open questions (to confirm before or while building)
1. Should assistant `thinking` blocks be indexed at all, or excluded by default?
2. Is the canvas layout auto-packed with sticky manual moves (hybrid, C3), and do manual moves persist per viewframe or globally?
3. Which agent mines first? A Claude Code subagent invoked on demand, or a scheduled background miner?
