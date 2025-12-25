# Change: Add Sphere of Influence TUI Demo

## Why
The system is evolving into a personal knowledge graph browser. A core insight is that every concept exists simultaneously as a **system** (containing related ideas) and as a **component** (participating in larger contexts).

We want a TUI demo that feels **alive**—not static ASCII art, but a breathing, responsive visualization. The knowledge graph should float on an ambient substrate that pulses with the system's "metabolism," creating a diffuse feedback channel between human and machine.

This serves as:
- A conceptual demonstration of graph duality
- A compelling, hypnotic intro to the project
- A foundation for future interactive graph navigation
- A proof-of-concept for ambient animation as UX primitive

## What Changes
- Add framebuffer-based TUI rendering (direct terminal control, no framework dependency)
- Create procedural noise field as ambient visual substrate
- Implement knowledge graph visualization with system/component frame transitions
- Add keyboard navigation for interactive exploration
- Establish clean separation between display layer and business logic

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Application                        │
│  ┌─────────────────┐    ┌─────────────────────────┐ │
│  │  Business Logic │    │     Display Layer       │ │
│  │                 │    │                         │ │
│  │  - Graph data   │───▶│  - Framebuffer          │ │
│  │  - State machine│    │  - Noise renderer       │ │
│  │  - Navigation   │    │  - Graph renderer       │ │
│  │  - Traversal    │    │  - Input handling       │ │
│  └─────────────────┘    └─────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Display layer is swappable.** The framebuffer implementation could be replaced with Ink, blessed, or any other TUI library without changing business logic.

## Impact
- Affected specs: New `tui-demo` capability
- Affected code: `demos/` directory (new), `package.json` (scripts)
- Dependencies: None (pure Node.js, no TUI framework required)
- No changes to existing backend/frontend functionality
