# Change: Rebuild as a scale navigator for a second-brain corpus

## Why
The project began as a shared bookmark app and grew TUI demos about zooming through knowledge graphs. The real goal is now clear: **navigate a personal corpus across powers of ten**, the way Spore lets you inhabit cell, creature, tribe, civilization and space. Agents should be able to keep up with non-linear, neurodivergent thinking without either side surveilling the other. This change specifies that behavior and its visual language first; implementation choices are deliberately deferred (see `design.md`).

## What Changes
- **BREAKING**: delete the bookmark app, the TUI demos, and the bookmark-era assistant commands, skills, agents and plugin. The superseded `add-microscope-lens-navigation` change is removed; its "lens" idea lives on as magic-lens viewframes. Git history keeps all of it.
- **ADDED `corpus-index`**: a component, separate from any interface, that ingests sources into one normalized, nested item set with provenance. Sources arrive in order: (1) Claude Code local transcripts, (2) Obsidian vault, (3) bookmarks, web clips and raw capture. The canvas and agents are clients of the index; the index never depends on them.
- **ADDED `zoom-canvas`**: a local web app combining *strategic zoom* (one continuous world where things swap representation as you pull back) with an *infinite ZUI* (anything can contain more world, no fixed depth). Aesthetic: cards on a spatial plane nested in containment regions. Structure is hybrid: the machine proposes, the user names, pins and moves.
- **ADDED `viewframes`**: the central primitive. A viewframe holds a perspective (query, ladder, layout, entry scale) and acts as a **portal**, a **magic lens**, or a **saved frame/path**. Frames nest and can be handed to agents. Ladders (Work, Time, Idea) are each just viewframes.
- **ADDED `agent-membrane`**: consent without surveillance. Frame = permission; beacons declare where you are; mined insights appear only as opt-in ambient traces (sparkles, soapstone marks, strands). Not ghost cards, not scale apertures, not postcards.
- **ADDED `visual-language`**: the design-system contract: semantic tokens with dark and light themes, representation tiers per item kind, a distinct grammar per trace type, viewframe visuals, calm motion, accessibility.

## Impact
- Affected specs: new `corpus-index`, `zoom-canvas`, `viewframes`, `agent-membrane`, `visual-language`; `tui-demo` removed.
- Affected code: the existing bookmark app, demos and bookmark-era assistant assets are deleted; the replacement is built only after the open decisions in `design.md` are resolved.
- Data: everything stays local and user-owned; nothing leaves the machine unless an agent the user runs reads a granted frame.
