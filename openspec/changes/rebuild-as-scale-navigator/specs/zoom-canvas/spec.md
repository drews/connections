## ADDED Requirements

### Requirement: Strategic Zoom Across Representations
The canvas SHALL render one continuous world in which each item changes representation according to its on-screen size, rather than entering discrete modes.

#### Scenario: Pulling back
- **WHEN** the user zooms out from a readable turn card
- **THEN** it becomes a compact card, then an icon, then a glow within its session region
- **AND** no navigation step or page change occurs

### Requirement: Continuous Representation Tiers with Hysteresis
Items SHALL have four representation tiers (full card, compact card, icon, glow), changing between tiers continuously, and the system SHALL apply hysteresis so an item hovering near a threshold does not flicker between tiers.

#### Scenario: Hovering at a threshold
- **WHEN** the zoom level oscillates slightly around a tier boundary
- **THEN** the item keeps its current tier until the zoom moves clearly past the boundary

#### Scenario: Smooth change
- **WHEN** an item changes tier
- **THEN** the change is a blend over time, not an instant swap

### Requirement: Infinite Containment
The canvas SHALL allow any region or portal card to contain further world, with no fixed maximum depth.

#### Scenario: Zooming into a portal
- **WHEN** the user zooms into a portal viewframe card
- **THEN** the card's world fills the screen and can itself contain portals

### Requirement: Powers-of-Ten Fly-To
The camera SHALL travel between distant places by pulling out until both places are in view, then moving in, rather than travelling in a straight line at constant scale.

#### Scenario: Flying between distant places
- **WHEN** the user selects a saved frame or search result far from the current view
- **THEN** the camera pulls out, crosses, and zooms in to the target
- **AND** the user can interrupt the flight at any time

### Requirement: Reduced Motion
The canvas SHALL honor the user's reduced-motion preference by replacing flights, blends and ambient animation with short fades or direct jumps.

#### Scenario: Reduced motion enabled
- **WHEN** reduced motion is preferred and the user selects a distant place
- **THEN** the view changes without traversal animation
- **AND** orientation is preserved by the regime HUD

### Requirement: Regime HUD and Powers-of-Ten Ladder
The canvas SHALL always show which regime the user is inhabiting, its available verbs, a powers-of-ten ladder indicating current scale that can be used to jump scale, and a one-key way to surface one regime up.

#### Scenario: Surfacing
- **WHEN** the user presses Escape at any depth
- **THEN** the camera flies to the enclosing regime

#### Scenario: Ladder jump
- **WHEN** the user selects a step on the ladder
- **THEN** the camera moves to that scale around the current focus

### Requirement: Hybrid Structure
The canvas SHALL arrange items by machine-proposed structure, and the user SHALL be able to name regions, pin items and move cards, with such edits taking precedence over proposals.

#### Scenario: Pinned card
- **WHEN** the user moves and pins a card and the layout is later recomputed
- **THEN** the card stays where the user put it

### Requirement: Private Re-entry Trail
The canvas SHALL keep a "where was I" trail of places the user lingered, stored only on the user's device and never shared with the index's other clients or agents.

#### Scenario: Going back
- **WHEN** the user presses the back key
- **THEN** the camera returns to the previous place on the trail

### Requirement: Local Web App
The canvas SHALL run as a web application on the user's machine, reachable only locally, with no external services required.

#### Scenario: Startup
- **WHEN** the user starts the app
- **THEN** the canvas opens in a browser showing the indexed corpus
