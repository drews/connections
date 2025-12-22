# Design: Sphere of Influence TUI Demo

## Context
This demo visualizes the core mental model of a personal knowledge graph: every concept exists simultaneously as a **system** (containing related ideas) and as a **component** (participating in larger contexts). The animation makes this duality tangible by smoothly transitioning between perspectives.

## Goals / Non-Goals
**Goals:**
- Visceral "aha moment" showing how knowledge nodes contain and are contained
- Rich mock data that feels like a real knowledge graph
- Smooth, hypnotic animation loop suitable for demo/presentation
- Foundation for future interactive graph navigation

**Non-Goals:**
- Real data integration (separate change)
- Interactive input handling (separate change)
- Production-ready performance

## Decisions

### TUI Framework: Ink
- React mental model fits the component/container duality we're visualizing
- `useState`/`useEffect` for animation state machine
- Clean component composition for rendering layers

### Core Concept: Frame Duality
The "sphere of influence" metaphor:
- **System-frame**: You see a node as a *container*—it holds related concepts, it's a micro-universe
- **Component-frame**: You see the same node as a *participant*—it's embedded in larger structures

The tween animation morphs one view into the other, reinforcing that both are true simultaneously.

### Visual Language
```
SYSTEM-FRAME (node as container):
╭────────────────────────────────────╮
│           ┌───────────┐            │
│     ┌─────┤  CONCEPT  ├─────┐      │
│     │     └─────┬─────┘     │      │
│     ▼           │           ▼      │
│ ┌───────┐  ┌────┴────┐  ┌───────┐  │
│ │related│  │ related │  │related│  │
│ │ idea  │  │  idea   │  │ idea  │  │
│ └───────┘  └─────────┘  └───────┘  │
╰────────────────────────────────────╯

         ↓↓↓  TWEEN  ↓↓↓

COMPONENT-FRAME (node in context):
╭────────────────────────────────────╮
│  [broader    [broader    [broader  │
│   context]    context]    context] │
│      │           │           │     │
│      └─────────┬─┴───────────┘     │
│           ┌────┴────┐              │
│           │ CONCEPT │              │
│           └────┬────┘              │
│      ┌─────────┼─────────┐         │
│      ▼         ▼         ▼         │
│  [peer]    [peer]    [peer]        │
╰────────────────────────────────────╯
```

### Mock Knowledge Graph Data
Compelling demo needs recognizable, interconnected concepts:

```javascript
const knowledgeGraph = {
  nodes: [
    // Core concepts
    { id: 'systems-thinking', label: 'Systems Thinking', type: 'concept' },
    { id: 'emergence', label: 'Emergence', type: 'concept' },
    { id: 'feedback-loops', label: 'Feedback Loops', type: 'concept' },
    { id: 'complexity', label: 'Complexity', type: 'concept' },

    // Connected ideas
    { id: 'cybernetics', label: 'Cybernetics', type: 'concept' },
    { id: 'ecology', label: 'Ecology', type: 'concept' },
    { id: 'network-effects', label: 'Network Effects', type: 'concept' },
    { id: 'self-organization', label: 'Self-Organization', type: 'concept' },

    // Broader contexts
    { id: 'philosophy', label: 'Philosophy', type: 'domain' },
    { id: 'biology', label: 'Biology', type: 'domain' },
    { id: 'economics', label: 'Economics', type: 'domain' },

    // Resources/artifacts
    { id: 'thinking-in-systems', label: '"Thinking in Systems"', type: 'resource' },
    { id: 'godel-escher-bach', label: '"Gödel, Escher, Bach"', type: 'resource' },
  ],

  edges: [
    // Systems Thinking contains/relates to
    { from: 'systems-thinking', to: 'emergence', weight: 0.9 },
    { from: 'systems-thinking', to: 'feedback-loops', weight: 0.95 },
    { from: 'systems-thinking', to: 'complexity', weight: 0.85 },
    { from: 'systems-thinking', to: 'cybernetics', weight: 0.7 },

    // Systems Thinking participates in
    { from: 'philosophy', to: 'systems-thinking', weight: 0.6 },
    { from: 'biology', to: 'systems-thinking', weight: 0.5 },
    { from: 'economics', to: 'systems-thinking', weight: 0.4 },

    // Cross-connections (what makes it a graph, not a tree)
    { from: 'emergence', to: 'self-organization', weight: 0.8 },
    { from: 'ecology', to: 'feedback-loops', weight: 0.7 },
    { from: 'network-effects', to: 'emergence', weight: 0.6 },
    { from: 'complexity', to: 'self-organization', weight: 0.75 },

    // Resources connect to concepts
    { from: 'thinking-in-systems', to: 'systems-thinking', weight: 1.0 },
    { from: 'thinking-in-systems', to: 'feedback-loops', weight: 0.9 },
    { from: 'godel-escher-bach', to: 'emergence', weight: 0.8 },
    { from: 'godel-escher-bach', to: 'self-organization', weight: 0.7 },
  ],

  // Demo will cycle through these as focal points
  demoSequence: ['systems-thinking', 'emergence', 'feedback-loops']
};
```

### Animation State Machine
```
IDLE_SYSTEM → TWEENING_TO_COMPONENT → IDLE_COMPONENT → TWEENING_TO_SYSTEM → IDLE_SYSTEM
     │                                       │
     └───── (auto-advance after pause) ──────┘
```

- **IDLE_SYSTEM**: Display system-frame for ~2s
- **TWEENING_TO_COMPONENT**: 1.5s animated transition
- **IDLE_COMPONENT**: Display component-frame for ~2s
- **TWEENING_TO_SYSTEM**: 1.5s animated transition back
- After full cycle, advance `focusNode` to next in sequence

### Tween Mechanics
Interpolate these properties:
- Node positions (radial layout → hierarchical layout)
- Node sizes (focal node grows/shrinks)
- Edge visibility (fade in/out based on relevance to current frame)
- Label prominence (focal node label always visible, others fade)

Easing: `easeInOutCubic` for smooth acceleration/deceleration

### Ambient Animation: Frequency & Amplitude Modulation
The visualization is never static. Even in "idle" states, elements breathe with subtle oscillation. This serves two purposes:
1. **Aesthetic**: Creates a living, organic feel—the graph pulses like a system with its own metabolism
2. **Feedback channel**: Modulation parameters become a diffuse signal layer for computer-user communication

```javascript
// Ambient oscillation model
const ambient = {
  // Base oscillators (always running)
  breathe: {
    frequency: 0.3,      // Hz - slow, meditative
    amplitude: 0.02,     // 2% scale variance
    phase: 0             // offset per node for desync
  },

  // Can be modulated by system state (future: activity, focus, alerts)
  drift: {
    frequency: 0.1,      // Hz - glacial positional drift
    amplitude: 2,        // pixels
    phase: 'perNode'     // each node drifts independently
  }
};

// Example: node scale at time t
const scale = baseScale * (1 + ambient.breathe.amplitude *
  Math.sin(2 * Math.PI * ambient.breathe.frequency * t + node.phase));
```

**Future feedback signals** (not in this change, but the architecture supports):
- Increased frequency = system activity/processing
- Increased amplitude = importance/urgency
- Phase synchronization = related nodes "locking in"
- Dampening = calm/completion state

### Visual Style: Monochrome + Texture
Embrace constraint. No color coding—instead use:

**Luminance hierarchy:**
- Focal node: bright/bold (`█`, `▓`)
- Direct connections: medium (`▒`, `░`)
- Peripheral nodes: dim (sparse characters, dots)

**Texture vocabulary:**
```
Dense/important:  ████  ▓▓▓▓  ████████
Medium:           ▒▒▒▒  ░░░░  ┃┃┃┃
Light/peripheral: ····  ....  ╌╌╌╌
Edges:            ───  ╌╌╌  ┄┄┄  ⋯⋯⋯
Containers:       ╭──╮  ┌──┐  ╔══╗
                  │  │  │  │  ║  ║
                  ╰──╯  └──┘  ╚══╝
```

**Node type differentiation via shape/texture (not color):**
- `concept`: rounded box `╭─╮╰─╯`
- `domain`: double-line box `╔═╗╚═╝`
- `resource`: brackets `⟦ ⟧` or quotes `「  」`

**Edge weight via density:**
```
Strong connection:  ════════════
Medium connection:  ────────────
Weak connection:    ╌╌╌╌╌╌╌╌╌╌╌╌
Faint connection:   ⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Unicode box-drawing varies by terminal | Test on common terminals, provide ASCII fallback |
| Complex graph hard to read in small terminal | Limit visible nodes, use proximity culling |
| Ink animation might flicker | Use `useStdout` for buffered writes |
| Ambient animation CPU usage | Cap frame rate, use efficient sin lookup |
| Texture chars unsupported | Detect and fall back to basic ASCII |

## Resolved Questions
- **Ambient animation**: Yes—frequency/amplitude modulation as diffuse feedback signal
- **Color scheme**: Monochrome with texture/luminance hierarchy
