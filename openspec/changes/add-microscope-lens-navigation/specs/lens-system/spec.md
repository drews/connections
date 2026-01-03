# lens-system Specification

## Purpose
Provides a pluggable lens abstraction for examining knowledge graph concepts through different cognitive modes (relational, spatial, temporal, etc.). Lenses modulate the ambient field to reveal different aspects of concepts and reconfigure navigation behavior.

## ADDED Requirements

### Requirement: Lens Abstraction
The system SHALL provide a Lens interface that encapsulates examination modes with distinct ambient field modulation, navigation rules, and rendering strategies.

#### Scenario: Equip lens
- **WHEN** user presses a number key (1-9) corresponding to an unlocked lens
- **THEN** the active lens switches to the selected lens
- **AND** the ambient field reconfigures according to lens modulation rules
- **AND** the rendering updates to show lens-specific frame layout

#### Scenario: Lens applicability check
- **GIVEN** user is viewing a dataset
- **WHEN** attempting to equip a lens
- **THEN** the lens is only equipable if it declares compatibility with the current dataset
- **AND** incompatible lenses appear grayed-out in the inventory

#### Scenario: Parfocal lens switching
- **GIVEN** user is examining a focal concept (e.g., Tiger)
- **WHEN** user switches from Containment lens to Kinship lens
- **THEN** the focal concept remains centered
- **AND** the visible nodes change to show siblings instead of children
- **AND** the ambient field smoothly transitions over approximately 1 second

### Requirement: Starter Kit Lenses
The system SHALL provide three always-available lenses: Containment, Kinship, and Magnitude.

#### Scenario: Containment lens
- **WHEN** Containment lens is equipped
- **THEN** the frame displays the focal node and its children
- **AND** the ambient field brightens downward proportional to child count
- **AND** ← → arrow keys navigate between siblings
- **AND** ↑ ↓ arrow keys zoom in/out of hierarchy (parent ↔ child)

#### Scenario: Kinship lens
- **WHEN** Kinship lens is equipped
- **THEN** the frame displays the focal node with its siblings/peers
- **AND** the ambient field creates attraction wells toward sibling positions
- **AND** ← → arrow keys cycle through peers
- **AND** ↑ ↓ arrow keys navigate to parent/child levels

#### Scenario: Magnitude lens
- **WHEN** Magnitude lens is equipped
- **AND** the focal node has a magnitude property (size, count, etc.)
- **THEN** the frame displays comparable nodes sorted by magnitude
- **AND** the ambient field density encodes relative size (denser = larger)
- **AND** ← → arrow keys navigate to smaller/larger comparables

### Requirement: Lens Discovery and Unlocking
The system SHALL track lens usage and automatically unlock advanced lenses when discovery conditions are met.

#### Scenario: Usage-based unlock
- **GIVEN** Lineage lens is locked
- **WHEN** user equips Containment lens 10 times
- **THEN** Lineage lens unlocks
- **AND** a notification displays "Lineage lens unlocked! Press 4 to trace ancestry."
- **AND** the lens inventory UI updates to show Lineage as unlocked

#### Scenario: Visit-based unlock
- **GIVEN** Trophic lens is locked (bio datasets only)
- **WHEN** user navigates to an apex predator node (Tiger, Shark, Orca, etc.)
- **THEN** Trophic lens unlocks
- **AND** a notification displays "Trophic lens unlocked! Explore the food web."

#### Scenario: Cross-dataset unlock
- **GIVEN** Semantic lens is locked
- **WHEN** user switches datasets 5 times using Tab key
- **THEN** Semantic lens unlocks
- **AND** a notification displays "Semantic lens unlocked! Find conceptual similarities."

### Requirement: Lens Inventory UI
The system SHALL display lens inventory status showing equipped, unlocked, and locked lenses.

#### Scenario: Inventory display
- **GIVEN** the demo is running
- **WHEN** rendering each frame
- **THEN** a lens inventory widget displays in a terminal corner
- **AND** shows lens number, name, and lock state
- **AND** the equipped lens is highlighted
- **AND** locked lenses appear grayed-out
- **AND** dataset-incompatible lenses show disabled state

#### Scenario: Context label
- **GIVEN** a lens is equipped
- **WHEN** rendering the chrome layer
- **THEN** a context label displays "Examining by: [Lens Name]"
- **AND** includes the lens description (e.g., "What does this hold?")

### Requirement: Ambient Field Modulation
Each lens SHALL modulate ambient field parameters (brightness, frequency, amplitude, texture) to encode information about the focal concept's relationships.

#### Scenario: Directional brightness modulation
- **GIVEN** Containment lens is equipped
- **AND** focal node has 5 children
- **WHEN** rendering the ambient field
- **THEN** the field brightens in the downward direction
- **AND** brightness intensity correlates with child count

#### Scenario: Attraction well creation
- **GIVEN** Kinship lens is equipped
- **AND** focal node has 3 siblings
- **WHEN** rendering the ambient field
- **THEN** the field creates Gaussian attraction wells at sibling positions
- **AND** well intensity correlates with relationship weight

#### Scenario: Oscillation frequency modulation
- **GIVEN** Lineage lens is equipped
- **AND** displaying an ancestry chain
- **WHEN** rendering the ambient field
- **THEN** oscillation frequency varies by temporal depth
- **AND** recent nodes oscillate faster than ancient nodes

### Requirement: Smooth Lens Transitions
When switching lenses, the ambient field SHALL smoothly interpolate between configurations to avoid jarring visual changes.

#### Scenario: Ambient field interpolation
- **GIVEN** user is viewing with Containment lens
- **WHEN** user switches to Kinship lens
- **THEN** the ambient field transitions smoothly over 1 second
- **AND** brightness, frequency, and texture parameters interpolate linearly
- **AND** the focal node remains visible throughout the transition
