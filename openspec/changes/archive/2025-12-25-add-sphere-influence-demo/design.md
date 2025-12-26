# Design: Sphere of Influence TUI Demo

## Context
This demo visualizes the core mental model of a personal knowledge graph with an emphasis on **ambient aliveness**. The visualization should feel organic, breathing, responsive—never static.

## Goals / Non-Goals

**Goals:**
- Visceral "aha moment" showing how knowledge nodes contain and are contained
- Living, ambient visual substrate (procedural noise field)
- Smooth transitions between system and component perspectives
- Interactive keyboard navigation
- Clean separation between display and business logic
- Zero external TUI framework dependencies

**Non-Goals:**
- Real data integration (separate change)
- Mouse input on Windows (Node.js TTY limitation)
- Production-ready performance optimization

## Architecture

### Layer Separation

```
demos/
├── sphere-hybrid.mjs      # Application entry point
└── lib/
    ├── knowledge-graph.mjs  # Business logic: graph data + traversal
    ├── animation.mjs        # Business logic: state machine + easing
    ├── framebuffer.mjs      # Display: terminal rendering + input
    ├── noise.mjs            # Display: procedural noise generation
    └── textures.mjs         # Display: character vocabulary
```

**Business Logic** (portable, no terminal dependencies):
- `knowledge-graph.mjs` - Graph structure, traversal helpers, demo sequence
- `animation.mjs` - State machine, timing, easing functions

**Display Layer** (terminal-specific, swappable):
- `framebuffer.mjs` - Double-buffered rendering, cell diffing, input handling
- `noise.mjs` - Perlin-style 3D noise with FBM
- `textures.mjs` - Box styles, density characters, visual vocabulary

### Framebuffer Architecture

```
┌─────────────────────────────────────┐
│  Alternate Screen Buffer            │
│  (isolates from normal terminal)    │
├─────────────────────────────────────┤
│  Double Buffering                   │
│  ┌─────────────┐  ┌─────────────┐   │
│  │ Front Buffer│  │ Back Buffer │   │
│  │ (displayed) │  │ (drawing)   │   │
│  └─────────────┘  └─────────────┘   │
├─────────────────────────────────────┤
│  Cell-Level Diffing                 │
│  Only changed cells emit ANSI       │
├─────────────────────────────────────┤
│  Input Handling                     │
│  Raw mode + keyboard parsing        │
│  (Mouse: platform-dependent)        │
└─────────────────────────────────────┘
```

### Rendering Layers

```
Layer 3: Chrome ────────────────────────────────
         Title, status bar, navigation hints

Layer 2: Knowledge Graph ───────────────────────
         Nodes (box-drawing), edges, labels
         System-frame or component-frame view

Layer 1: Ambient Noise Field ───────────────────
         Procedural noise (Perlin + FBM)
         Brightens near focus node
         Creates "living" substrate
```

## Decisions

### Why Not Ink/React?
- **Dependency weight**: Ink pulls in React, yoga-layout, etc.
- **Control**: Direct framebuffer gives precise cell-level control
- **Performance**: Cell diffing is more efficient than React reconciliation for this use case
- **Portability**: Pure Node.js, no native dependencies
- **Learning**: Understanding terminal rendering from first principles

The Ink version (`sphere.mjs`) is preserved as `npm run demo:ink` for comparison.

### Procedural Noise as Ambient Substrate
The noise field isn't decoration—it's a **feedback channel**:

```javascript
// Noise modulation parameters (future expansion)
const ambient = {
  baseFrequency: 0.06,    // Spatial scale
  timeScale: 0.1,         // Animation speed

  // Future: modulate based on system state
  // - Higher frequency = activity/processing
  // - Higher amplitude = importance/urgency
  // - Dampening = calm/completion
};
```

### Visual Language

**Colors (256-color mode):**
- Background: Blue gradient (17-21) - calm ambient field
- Focus influence: Brighter blue near active node
- Nodes: White (255) for primary, dim (245) for secondary
- Accent: Orange (208) for focus node

**Node Types via Shape:**
```
concept:  ╭─────╮    (rounded corners)
          │ ... │
          ╰─────╯

domain:   ╔═════╗    (double-line, authoritative)
          ║ ... ║
          ╚═════╝

resource: ⟦ ... ⟧    (brackets, artifact)
```

**Character Density for Noise:**
```
' ' → '·' → '.' → ',' → ':' → ';'
(empty)                    (dense)
```

### State Machine

```
IDLE_SYSTEM ──────────────────────────────────▶ TWEENING_TO_COMPONENT
     │                                                   │
     │ (2s pause)                                        │ (1.5s tween)
     │                                                   ▼
TWEENING_TO_SYSTEM ◀────────────────────────── IDLE_COMPONENT
     │                                                   │
     │ (1.5s tween)                              (2s pause)
     ▼                                                   │
   (advance to next node) ◀──────────────────────────────┘
```

**Auto mode**: Cycles automatically through demo sequence
**Manual mode**: User controls navigation with arrow keys

### Input Handling

```
Space     Toggle auto/manual mode
← →       Navigate between focus nodes (manual)
↑ ↓       Toggle system/component frame (manual)
Ctrl+C    Exit
```

**Platform note**: Mouse input works on macOS/Linux but not native Windows due to Node.js TTY limitation (see nodejs/node#56338).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| No mouse on Windows | Keyboard controls as primary; document limitation |
| Terminal compatibility | Test on Windows Terminal, iTerm2, Alacritty |
| Unicode rendering | Common box-drawing chars; could add ASCII fallback |
| CPU usage from noise | Cap FPS at 20; simple 2-octave FBM |

## Resolved Questions
- **TUI framework**: Framebuffer-first (no Ink dependency for main demo)
- **Ambient animation**: Procedural noise field as substrate
- **Color scheme**: Blue ambient field, orange focus accent
- **Input model**: Keyboard-primary, mouse as enhancement where supported
