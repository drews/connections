# Tasks

## Phase A — Spec & design system (now)
- [ ] A.1 Finalize specs for corpus-index, zoom-canvas, viewframes, agent-membrane, visual-language
- [ ] A.2 Design-system mockup: tokens (dark and light), representation tiers per item kind, trace grammar, viewframe visuals
- [ ] A.3 Resolve each open decision in `design.md`; record the choice and reasoning
- [ ] A.4 Validate the change strictly; revise specs where decisions require

## Phase B — Implementation (after decisions)

### B0. Clear the ground
- [ ] B0.1 Delete the bookmark app, its container and script files, the TUI demos and bookmark-era assistant assets
- [ ] B0.2 Remove the `add-microscope-lens-navigation` change; drop `tui-demo` on archive
- [ ] B0.3 Rewrite README, assistant config and project conventions for the new direction

### B1. corpus-index (Claude Code first)
- [ ] B1.1 Item model with provenance, times, project, exclusion marks
- [ ] B1.2 Claude Code transcript adapter (project → session → turn → step), incremental ingest
- [ ] B1.3 Query interface (filter and group-by-ladder) with tests on fixture transcripts
- [ ] B1.4 Command to ingest and query without the canvas

### B2. zoom-canvas
- [ ] B2.1 Camera: smooth zoom, pan, pull-out-then-in fly-to, reduced-motion path
- [ ] B2.2 Containment layout for the Work ladder; continuous representation tiers with hysteresis
- [ ] B2.3 Regime HUD, powers-of-ten ladder, private "where was I" trail
- [ ] B2.4 Reading a turn and its steps at the finest scale; open-at-origin

### B3. viewframes
- [ ] B3.1 Viewframe model, nesting and persistence
- [ ] B3.2 Portal behavior
- [ ] B3.3 Magic-lens behavior
- [ ] B3.4 Saved frames and paths; Time ladder as a second frame

### B4. visual-language
- [ ] B4.1 Implement tokens and themes from the approved mockup
- [ ] B4.2 Tier visuals per item kind; viewframe and trace visuals
- [ ] B4.3 Accessibility pass (contrast, reduced motion, keyboard)

### B5. agent-membrane
- [ ] B5.1 Grants (frame → agent) and frame-scoped agent access
- [ ] B5.2 Beacons
- [ ] B5.3 Trace store (sparkle, soapstone, strand) with decay and engagement feedback
- [ ] B5.4 Render traces; opt-in insight layer toggle
- [ ] B5.5 Handing a viewframe to an agent
- [ ] B5.6 First miner (e.g. "these two sessions are the same idea" → strand)

### B6. Next sources
- [ ] B6.1 Obsidian vault adapter
- [ ] B6.2 Bookmarks, web clips, raw capture
