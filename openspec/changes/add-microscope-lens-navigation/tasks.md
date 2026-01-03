# Tasks: Add Microscope Lens Navigation

## 1. Lens Abstraction Foundation
- [ ] 1.1 Create `demos/lib/lens-registry.mjs` - Lens catalog and metadata
- [ ] 1.2 Create `demos/lib/lens.mjs` - Base Lens class with interface methods
- [ ] 1.3 Create `demos/lib/lens-inventory.mjs` - Unlock tracking, equipped state
- [ ] 1.4 Create `demos/lib/ambient-modulation.mjs` - Field modulation utilities
- [ ] 1.5 Update `sphere-hybrid.mjs` - Integrate lens system into main loop

## 2. Starter Kit Lenses (Always Unlocked)
- [ ] 2.1 Implement `demos/lib/lenses/containment.mjs`
  - [ ] Ambient: Brighten downward based on child count
  - [ ] Navigation: ←→ siblings, ↑↓ zoom hierarchy
  - [ ] Rendering: Tree layout (parent → children)
- [ ] 2.2 Implement `demos/lib/lenses/kinship.mjs`
  - [ ] Ambient: Attraction wells toward siblings
  - [ ] Navigation: ←→ cycle peers, ↑↓ parent/child levels
  - [ ] Rendering: Radial layout (focal + peers)
- [ ] 2.3 Implement `demos/lib/lenses/magnitude.mjs`
  - [ ] Ambient: Density gradient by size
  - [ ] Navigation: ←→ sort by magnitude
  - [ ] Rendering: Horizontal scale comparison

## 3. Lens Inventory UI
- [ ] 3.1 Design inventory widget layout (corner display)
- [ ] 3.2 Render lens list with states (equipped/unlocked/locked)
- [ ] 3.3 Add context label ("Examining by: Containment")
- [ ] 3.4 Implement dataset applicability indicators (grayed-out)

## 4. Discovery Mechanics
- [ ] 4.1 Define unlock rules in `lens-registry.mjs`
- [ ] 4.2 Implement usage tracking in `lens-inventory.mjs`
- [ ] 4.3 Add unlock trigger evaluation
- [ ] 4.4 Implement unlock notifications (toast-style messages)
- [ ] 4.5 Test unlock thresholds (adjust for satisfying progression)

## 5. Unlockable Lenses (Tier 2)
- [ ] 5.1 Implement `demos/lib/lenses/lineage.mjs`
  - [ ] Unlock: Use Containment 10 times
  - [ ] Ambient: Oscillation frequency = temporal depth
  - [ ] Navigation: ←→ ancestors, ↑↓ zoom timeline
  - [ ] Rendering: Vertical ancestry chain
- [ ] 5.2 Implement `demos/lib/lenses/trophic.mjs` (bio only)
  - [ ] Unlock: Visit apex predator node
  - [ ] Ambient: Flow arrows (prey → predator)
  - [ ] Navigation: ←→ prey/predator, ↑↓ trophic level
  - [ ] Rendering: Food web layout

## 6. Dataset Integration
- [ ] 6.1 Add lens applicability metadata to datasets
- [ ] 6.2 Implement lens compatibility checking
- [ ] 6.3 Handle dataset switching with lens preservation
- [ ] 6.4 Add fallback logic (incompatible lens → Containment)

## 7. Ambient Field Transitions
- [ ] 7.1 Implement parameter interpolation (1s smooth transition)
- [ ] 7.2 Test transition smoothness across all lens pairs
- [ ] 7.3 Handle edge case: rapid lens switching

## 8. Input Handling
- [ ] 8.1 Add number key (1-9) parsing to `framebuffer.mjs`
- [ ] 8.2 Wire number keys to lens equip actions
- [ ] 8.3 Update arrow key handler to delegate to active lens
- [ ] 8.4 Update status bar to show lens controls

## 9. Polish & Testing
- [ ] 9.1 Test all lenses with both datasets (animalia, knowledge)
- [ ] 9.2 Verify unlock mechanics feel rewarding not grindy
- [ ] 9.3 Ensure ambient field transitions feel organic
- [ ] 9.4 Add lens descriptions to help text
- [ ] 9.5 Test parfocal behavior (focus stays centered on lens switch)

## 10. Documentation
- [ ] 10.1 Update README with lens system overview
- [ ] 10.2 Document how to add new lenses
- [ ] 10.3 Document unlock trigger system

## Deliverables
- Pluggable lens system with 5 lenses (3 starter, 2 unlockable)
- Discovery mechanics that reward exploration
- Ambient field as sensory transducer (not decoration)
- Lens inventory UI with lock states
- Smooth lens transitions (1s interpolation)
- Dataset-aware lens applicability
