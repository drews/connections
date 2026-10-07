## ADDED Requirements

### Requirement: Semantic Design Tokens
The visual language SHALL define semantic tokens for surface, ink, accent, beacon and trace colors, and SHALL provide both a dark and a light theme from the same tokens.

#### Scenario: Theme switch
- **WHEN** the user changes theme or the system theme changes
- **THEN** all views re-render from the other token set with no hard-coded colors left behind

### Requirement: Representation Tiers per Item Kind
Each item kind (turn, session, project, note, viewframe) SHALL define its appearance at every representation tier (full card, compact card, icon, glow), such that kinds remain distinguishable at every tier.

#### Scenario: Distinguishing kinds
- **WHEN** a session and a note are both shown as icons
- **THEN** their shapes or marks differ without relying on color alone

### Requirement: Distinct Trace Grammar
Each trace type SHALL have its own visual grammar: a sparkle as a shimmer on the item, a soapstone mark as a glyph legible only up close, and a strand as a bridge between two distant places.

#### Scenario: Telling traces apart
- **WHEN** one of each trace type is on screen
- **THEN** each is recognizable as its type without reading text

#### Scenario: Soapstone at distance
- **WHEN** a soapstone mark is far from the camera
- **THEN** it reads as a faint mark, and its glyph resolves only at close range

### Requirement: Viewframe Visuals
Viewframes SHALL be visually distinguishable from content cards, and portal, magic lens and saved frame SHALL each look different from one another.

#### Scenario: Three modes side by side
- **WHEN** a portal, a lens and a saved frame appear together
- **THEN** a user can tell which is which at a glance

### Requirement: Calm Motion
The interface SHALL NOT use notifications, badges, counters or any element that demands attention; motion SHALL be ambient and subordinate to the user's own action.

#### Scenario: New trace arrives
- **WHEN** an agent adds a trace
- **THEN** no alert, sound, badge or count appears; the trace is simply discoverable in place

### Requirement: Accessibility
The visual language SHALL meet contrast guidelines in both themes, honor reduced motion, and make every interactive element reachable and operable by keyboard.

#### Scenario: Keyboard only
- **WHEN** the user navigates without a pointer
- **THEN** they can move focus between cards, enter and surface frames, and engage traces

#### Scenario: Contrast
- **WHEN** text is shown at the full or compact tier in either theme
- **THEN** its contrast against its surface meets the required minimum
