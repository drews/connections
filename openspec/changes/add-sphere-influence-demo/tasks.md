# Tasks: Add Sphere of Influence TUI Demo

## 1. Display Layer Infrastructure
- [x] 1.1 Create `demos/lib/framebuffer.mjs` - double-buffered terminal rendering
- [x] 1.2 Implement cell-level diffing for efficient updates
- [x] 1.3 Add alternate screen buffer and cursor control
- [x] 1.4 Implement keyboard input handling (raw mode)
- [x] 1.5 Add mouse tracking (platform-dependent, works on macOS/Linux)

## 2. Ambient Animation
- [x] 2.1 Create `demos/lib/noise.mjs` - Perlin-style 3D noise
- [x] 2.2 Implement FBM (Fractal Brownian Motion) for organic feel
- [x] 2.3 Create character density ramp for noise visualization
- [x] 2.4 Add focus-point influence (brightening near cursor/node)

## 3. Business Logic
- [x] 3.1 Create `demos/lib/knowledge-graph.mjs` - mock graph data
- [x] 3.2 Implement graph traversal helpers (getChildren, getParents, getPeers)
- [x] 3.3 Define demo sequence for auto-cycling
- [x] 3.4 Create `demos/lib/animation.mjs` - state machine
- [x] 3.5 Implement easing functions for smooth transitions
- [x] 3.6 Add ambient oscillators (breathe, drift) with phase offsets

## 4. Visual Rendering
- [x] 4.1 Create `demos/lib/textures.mjs` - box styles per node type
- [x] 4.2 Implement system-frame rendering (node as container)
- [x] 4.3 Implement component-frame rendering (node in context)
- [x] 4.4 Add transition overlay with progress indicator
- [x] 4.5 Implement layered compositing (noise → graph → chrome)

## 5. Integration
- [x] 5.1 Create `demos/sphere-hybrid.mjs` - main entry point
- [x] 5.2 Wire keyboard navigation (Space, arrows)
- [x] 5.3 Implement auto/manual mode toggle
- [x] 5.4 Add graceful exit handling (Ctrl+C)
- [x] 5.5 Update `package.json` with demo scripts

## 6. Polish
- [x] 6.1 Add title bar and status chrome
- [x] 6.2 Add navigation hints based on mode
- [ ] 6.3 Test on multiple terminals (Windows Terminal, iTerm2)
- [ ] 6.4 Document Windows mouse limitation

## Deliverables
- `npm run demo` - Hybrid demo (framebuffer + noise + graph)
- `npm run demo:ink` - Original Ink version (preserved)
- `npm run demo:ambient` - Noise field POC (exploratory)
