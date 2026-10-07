## ADDED Requirements

### Requirement: Strategic Zoom Across Representations
The canvas SHALL render one continuous world in which each item swaps representation by on-screen size (full card, compact card, icon, glow) rather than by entering discrete modes.

#### Scenario: Pulling back
- **WHEN** the user zooms out from a readable turn card
- **THEN** it becomes a compact card, then an icon, then a glow within its session region
- **AND** no navigation step or page change occurs

### Requirement: Infinite Containment
The canvas SHALL allow any region or portal card to contain further world, with no fixed maximum depth.

#### Scenario: Zooming into a portal
- **WHEN** the user zooms into a portal viewframe card
- **THEN** the card's world fills the screen and can itself contain portals

### Requirement: Regime Awareness
The canvas SHALL always show which regime the user is inhabiting, its available verbs, and a one-key way to surface one regime up.

#### Scenario: Surfacing
- **WHEN** the user presses Escape at any depth
- **THEN** the camera flies to the enclosing regime

### Requirement: Private Re-entry Trail
The canvas SHALL keep a "where was I" trail of places the user lingered, stored only in the browser and never sent to the server or agents.

#### Scenario: Going back
- **WHEN** the user presses the back key
- **THEN** the camera returns to the previous place on the trail

### Requirement: Local Web App
The canvas SHALL run as a local Node server bound to localhost plus a browser client, with no external services.

#### Scenario: Startup
- **WHEN** the user runs the start command
- **THEN** the canvas opens on localhost showing the indexed corpus
