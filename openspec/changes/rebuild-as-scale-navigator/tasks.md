# Tasks

## 0. Clear the ground
- [ ] 0.1 Delete bookmark app, Docker files, scripts, `demos/`, bookmark-era `.claude/` assets
- [ ] 0.2 Remove the `add-microscope-lens-navigation` change; drop `tui-demo` spec on archive
- [ ] 0.3 Rewrite README, `.claude/CLAUDE.md`, `openspec/project.md` for the new direction

## 1. corpus-index (Claude Code first)
- [ ] 1.1 Item schema and `node:sqlite` store with FTS5
- [ ] 1.2 Claude Code transcript adapter (project → session → turn → step), incremental tail-reading
- [ ] 1.3 Query API (filter and group-by-ladder) with tests on fixture transcripts
- [ ] 1.4 CLI: `index ingest`, `index query`

## 2. zoom-canvas
- [ ] 2.1 Local server and canvas camera (smooth zoom, pan, fly-to)
- [ ] 2.2 Containment layout for the Work ladder; strategic representation swaps
- [ ] 2.3 Regime HUD, powers-of-ten ladder, local "where was I" trail
- [ ] 2.4 Reading a turn and its steps at the finest scale

## 3. viewframes
- [ ] 3.1 Viewframe model and persistence
- [ ] 3.2 Portal behaviour (zoom into a frame = inhabit its world)
- [ ] 3.3 Magic-lens behaviour (drag over canvas, re-render beneath)
- [ ] 3.4 Saved frames and paths; Time ladder as a second frame

## 4. agent-membrane
- [ ] 4.1 Grants (frame → agent) and frame-scoped agent API/CLI
- [ ] 4.2 Beacons
- [ ] 4.3 Trace store (sparkle, soapstone, strand) with decay and engagement feedback
- [ ] 4.4 Render traces on canvas; opt-in insight layer toggle
- [ ] 4.5 First miner (e.g. "these two sessions are the same idea" → strand)

## 5. Next sources
- [ ] 5.1 Obsidian vault adapter
- [ ] 5.2 Bookmarks, web clips, raw stream capture
