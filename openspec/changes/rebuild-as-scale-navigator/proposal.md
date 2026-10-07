# Change: Rebuild as a scale navigator for a second-brain corpus

## Why
The project began as a shared bookmark app and grew TUI demos about zooming through knowledge graphs. The real goal is now clear: **navigate a personal corpus across powers of ten**, the way Spore lets you inhabit cell, creature, tribe, civilization and space. Agents should be able to keep up with non-linear, neurodivergent thinking without either side surveilling the other. That needs a fresh foundation, not another feature on a bookmark app.

## What Changes
- **BREAKING**: delete the bookmark app (`backend/`, `frontend/`, Docker files, import/test scripts), the TUI demos (`demos/`), and the bookmark-era `.claude/` commands, skills, agents and plugin. The superseded `add-microscope-lens-navigation` change is removed; its "lens" idea lives on as magic-lens viewframes. Git history keeps all of it.
- **ADDED `corpus-index`**: a separate package that ingests sources into one normalized, nested item store (SQLite with full-text search). Sources arrive in order: (1) Claude Code local transcripts, (2) Obsidian vault, (3) bookmarks, web clips and raw stream capture. The canvas and agents are clients of this index; the index never depends on them.
- **ADDED `zoom-canvas`**: a local web app (Node server on localhost plus a browser canvas). It combines *strategic zoom* (one continuous world where things swap representation as you pull back: full card, then compact card, then icon, then glow) with an *infinite ZUI* (anything can contain more world, with no fixed depth). The visual language is cards on a spatial plane nested in containment regions.
- **ADDED `viewframes`**: the central primitive. A viewframe is a card that holds a perspective: a query, a ladder (how items group as you zoom), a layout, and an entry scale. One viewframe can behave as a **portal** (zoom in to inhabit it), a **magic lens** (drag it over the canvas and what's beneath re-renders through it), or a **saved frame** (a named place you return to, chainable into paths). Ladders (work, time, idea) are just different viewframes over the same corpus.
- **ADDED `agent-membrane`**: consent without surveillance, in both directions.
  - *Frame = permission*: an agent sees only the viewframes you've granted it.
  - *Beacons*: you explicitly declare where you are; nothing is inferred from your activity.
  - *Mined insights as opt-in ambient affordances*: agents never insert content into your space. They leave traces you can choose to engage with: **sparkles** (something shimmers; investigate to reveal), **soapstone marks** (short glyph messages readable only up close, which you can appraise), and **strands** (bridges between distant regions; traverse, keep, or let decay).

## Impact
- Affected specs: new `corpus-index`, `zoom-canvas`, `viewframes`, `agent-membrane`; `tui-demo` removed.
- Affected code: nearly everything. New layout: `packages/index`, `packages/canvas`, `packages/membrane`.
- Dependencies: aim for zero runtime dependencies (Node 22 built-ins: `node:sqlite`, `node:http`, `fs.watch`). Embeddings come later and stay optional and local.
- Data: everything stays in local files the user owns. Nothing leaves the machine unless an agent the user runs reads a granted frame.
