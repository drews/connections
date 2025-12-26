# tui-demo Specification

## Purpose
TBD - created by archiving change add-sphere-influence-demo. Update Purpose after archive.
## Requirements
### Requirement: Sphere of Influence Animation
The system SHALL provide a terminal-based animated demo that visualizes knowledge graph concepts by smoothly transitioning between system-frame (node as container) and component-frame (node as participant) perspectives.

#### Scenario: Demo startup
- **WHEN** user runs `npm run demo`
- **THEN** the terminal displays an animated knowledge graph visualization
- **AND** the demo begins with the system-frame view of the first focal node

#### Scenario: System-to-component transition
- **WHEN** the demo is displaying a node in system-frame (container view)
- **AND** the idle duration elapses
- **THEN** the view smoothly tweens to component-frame (participant view)
- **AND** the transition uses eased animation over approximately 1.5 seconds

#### Scenario: Component-to-system transition
- **WHEN** the demo is displaying a node in component-frame (participant view)
- **AND** the idle duration elapses
- **THEN** the view smoothly tweens to system-frame of the next focal node
- **AND** the demo cycles through predefined focal nodes

#### Scenario: Graceful exit
- **WHEN** user presses Ctrl+C during the demo
- **THEN** the demo exits cleanly without leaving terminal in corrupted state

### Requirement: Mock Knowledge Graph Data
The demo SHALL use a self-contained mock knowledge graph representing interconnected concepts without requiring database connectivity.

#### Scenario: Graph structure
- **GIVEN** the demo is running
- **WHEN** rendering any frame
- **THEN** the visualization draws from a predefined graph of concepts, domains, and resources
- **AND** edges represent meaningful relationships between nodes

#### Scenario: Node type differentiation
- **GIVEN** the mock graph contains nodes of types: concept, domain, resource
- **WHEN** nodes are rendered
- **THEN** different node types are visually distinguishable

### Requirement: Ambient Animation
The visualization SHALL exhibit continuous ambient motion even during idle states, using frequency and amplitude modulation as a diffuse feedback signal.

#### Scenario: Breathing oscillation
- **GIVEN** the demo is in any state (idle or transitioning)
- **WHEN** rendering frames
- **THEN** nodes exhibit subtle scale oscillation ("breathing")
- **AND** the oscillation frequency is slow and meditative (~0.3 Hz)

#### Scenario: Per-node phase offset
- **GIVEN** multiple nodes are visible
- **WHEN** ambient animation is applied
- **THEN** each node has an independent phase offset
- **AND** nodes do not oscillate in perfect synchronization

#### Scenario: Positional drift
- **GIVEN** the demo is rendering
- **WHEN** nodes are displayed
- **THEN** nodes exhibit subtle positional drift over time
- **AND** the drift is slow enough to feel organic rather than jittery

### Requirement: Monochrome Visual Style with Texture
The demo SHALL use a monochrome color scheme with visual differentiation achieved through texture density and character choice rather than color.

#### Scenario: Luminance hierarchy
- **GIVEN** nodes at varying distances from the focal node
- **WHEN** rendering
- **THEN** the focal node uses dense/bright characters
- **AND** directly connected nodes use medium-density characters
- **AND** peripheral nodes use sparse/dim characters

#### Scenario: Node type differentiation
- **GIVEN** nodes of types concept, domain, and resource
- **WHEN** rendering node containers
- **THEN** each type uses a distinct box-drawing style (rounded, double-line, brackets)

#### Scenario: Edge weight visualization
- **GIVEN** edges with varying weights
- **WHEN** rendering connections
- **THEN** stronger connections use denser line characters
- **AND** weaker connections use sparser/dotted line characters

### Requirement: Terminal-Responsive Layout
The demo SHALL adapt its layout to the terminal dimensions.

#### Scenario: Reasonable terminal size
- **GIVEN** terminal width >= 60 columns and height >= 20 rows
- **WHEN** the demo renders
- **THEN** the visualization fits within the terminal bounds

#### Scenario: Terminal resize
- **WHEN** the terminal is resized during demo playback
- **THEN** the layout adjusts to the new dimensions on the next frame

