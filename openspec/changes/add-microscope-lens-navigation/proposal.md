# Change: Add Microscope Lens Navigation with Powerup System

## Why

The current TUI demo has rigid navigation—hardcoded demo sequences and only one duality (system vs component frame). Users can't freely explore concepts through different cognitive lenses (relational, spatial, temporal, etc.).

We want to transform the demo into an **adaptive information architecture browser** that uses microscopy as its conceptual model:

- **Datasets = Levels**: Tree of Life, Systems Thinking, future knowledge graphs
- **Objective Lenses = Powerups**: Different examination modes (Containment, Kinship, Magnitude, Lineage, etc.)
- **Ambient Field = Illumination**: Reconfigures to reveal different aspects based on active lens
- **Discovery Mechanics**: Unlockable lenses reward exploration and align with dataset capabilities

This makes navigation **explorative** rather than prescriptive, supporting different cognitive modes (relational, ordinal, cardinal, spatial) while maintaining the ambient aliveness.

## What Changes

### Core Architecture
- Introduce `Lens` abstraction that encapsulates:
  - Ambient field modulation rules (brightness, frequency, texture patterns)
  - Navigation behavior (what arrow keys do)
  - Node filtering/visibility rules
  - Rendering mode (frame layout)
- Replace hardcoded state machine with lens-driven navigation
- Add lens inventory system (equipped, unlocked, locked states)
- Implement discovery mechanics (usage tracking → unlock triggers)

### Starter Kit Lenses (Always Available)
1. **Containment**: "What does this hold?" - Shows children, field brightens downward
2. **Kinship**: "Who are my relatives?" - Shows siblings/peers, field creates attraction wells
3. **Magnitude**: "How does it compare?" - Size/scale comparison, field density = relative magnitude

### Unlockable Lenses
4. **Lineage**: "Where did I come from?" - Ancestry chain, oscillation frequency = temporal depth
5. **Trophic** (bio only): "What do I eat?" - Predator-prey network
6. **Geographic** (bio only): "Where do I live?" - Distribution/habitat overlap
7. **Semantic** (knowledge graphs): "What am I similar to?" - Conceptual similarity
8. **Centrality** (networks): "How connected am I?" - Hub/spoke visualization

### Input Model
- **Number keys (1-9)**: Switch active lens (if unlocked)
- **Arrow keys**: Lens-specific navigation (e.g., ←→ navigate siblings in Kinship, ←→ size comparison in Magnitude)
- **Tab**: Switch dataset/level
- **Space**: Toggle auto-cycle vs manual control (retained)

### UI Changes
- Lens inventory display (corner widget showing equipped/unlocked/locked)
- Lens context label (e.g., "Examining by: Magnitude")
- Discovery notifications ("Lineage lens unlocked!")
- Dataset applicability hints (grayed-out lenses for incompatible datasets)

## Impact

### Affected Specs
- **MODIFIED**: `tui-demo` - New navigation model, lens system
- **ADDED**: `lens-system` - Lens abstraction, inventory, discovery mechanics

### Affected Code
- `demos/sphere-hybrid.mjs` - Navigation overhaul, lens integration
- `demos/lib/lenses/*.mjs` - New lens implementations (one file per lens)
- `demos/lib/lens-inventory.mjs` - Unlock tracking, discovery rules
- `demos/lib/framebuffer.mjs` - Minor: additional input parsing if needed

### No Changes To
- Backend/frontend bookmark system (completely independent)
- Existing datasets (animalia-graph, knowledge-graph remain unchanged)
- Framebuffer core rendering (still double-buffered cell diffing)
- Ambient noise infrastructure (reused, modulated by lenses)
