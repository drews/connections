# Tasks: Add Sphere of Influence TUI Demo

## 1. Setup
- [ ] 1.1 Install Ink and dependencies (`ink`, `react`, `ink-box` or similar)
- [ ] 1.2 Add `npm run demo` script to package.json
- [ ] 1.3 Create `demos/` directory structure

## 2. Data Layer
- [ ] 2.1 Create `demos/data/knowledge-graph.js` with mock graph data
- [ ] 2.2 Implement graph traversal helpers (get children, get parents, get peers)
- [ ] 2.3 Define demo sequence (which nodes to cycle through)

## 3. Animation Engine
- [ ] 3.1 Create animation state machine (IDLE_SYSTEM → TWEEN → IDLE_COMPONENT → TWEEN)
- [ ] 3.2 Implement easing functions for smooth transitions
- [ ] 3.3 Create interpolation logic for node positions and sizes
- [ ] 3.4 Implement ambient oscillator system (breathe + drift)
- [ ] 3.5 Add per-node phase offsets for organic desynchronization

## 4. Rendering
- [ ] 4.1 Create texture/character vocabulary module (box styles, edge densities)
- [ ] 4.2 Create SystemFrame component (node as container view)
- [ ] 4.3 Create ComponentFrame component (node in context view)
- [ ] 4.4 Create TweenOverlay component for transition effects
- [ ] 4.5 Implement luminance hierarchy (focal → direct → peripheral)
- [ ] 4.6 Implement terminal-size-aware layout calculations

## 5. Integration
- [ ] 5.1 Wire up main demo loop in `demos/sphere.js`
- [ ] 5.2 Add graceful exit handling (Ctrl+C)
- [ ] 5.3 Test on different terminal sizes

## 6. Polish
- [ ] 6.1 Add startup banner/instructions
- [ ] 6.2 Fine-tune animation timing and easing
- [ ] 6.3 Verify box-drawing characters render correctly
