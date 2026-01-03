## MODIFIED Requirements

### Requirement: Navigation Model
The demo SHALL use a lens-based navigation system where number keys switch examination modes and arrow keys perform lens-specific navigation.

#### Scenario: Lens-based navigation
- **GIVEN** the demo is running with a lens equipped
- **WHEN** user presses arrow keys
- **THEN** the navigation behavior matches the active lens's rules
- **AND** each lens interprets ← → ↑ ↓ differently
- **FOR EXAMPLE** Containment: ←→ siblings, ↑↓ hierarchy; Kinship: ←→ peers, ↑↓ parents/children

#### Scenario: Number key lens switching
- **GIVEN** a lens is unlocked and applicable to current dataset
- **WHEN** user presses the lens's number key (1-9)
- **THEN** the active lens switches
- **AND** the ambient field and frame rendering update accordingly

#### Scenario: Dataset switching preserves lens
- **GIVEN** user is viewing Tree of Life with Kinship lens equipped
- **WHEN** user presses Tab to switch to Systems Thinking dataset
- **AND** Kinship lens is applicable to Systems Thinking
- **THEN** Kinship lens remains equipped
- **AND** the focal concept resets to the new dataset's default

#### Scenario: Dataset switching with incompatible lens
- **GIVEN** user is viewing Tree of Life with Trophic lens equipped
- **WHEN** user presses Tab to switch to Systems Thinking dataset
- **AND** Trophic lens is not applicable to Systems Thinking
- **THEN** the lens automatically switches to Containment (fallback)
- **AND** a notification displays "Trophic lens not available for this dataset"

### Requirement: Ambient Field as Sensory Transducer
The ambient noise field SHALL act as the primary sensory mechanism, modulated by lenses to reveal different aspects of concepts.

#### Scenario: Field reveals relationships
- **GIVEN** Containment lens is equipped
- **AND** focal node contains 8 children
- **WHEN** rendering the ambient field
- **THEN** the field brightens in areas where children are positioned
- **AND** the observer perceives "fullness" or "richness" through field density

#### Scenario: Field encodes hierarchy depth
- **GIVEN** Lineage lens is equipped
- **AND** displaying ancestry from Kingdom to Species
- **WHEN** rendering the ambient field
- **THEN** oscillation frequency decreases with temporal depth
- **AND** the observer perceives "age" through oscillation rhythm

### Requirement: Progressive Lens Discovery
Advanced lenses SHALL unlock through organic exploration rather than explicit achievements.

#### Scenario: Starter kit availability
- **WHEN** demo starts for the first time
- **THEN** Containment, Kinship, and Magnitude lenses are unlocked
- **AND** all other lenses show as locked in inventory

#### Scenario: Natural unlock triggers
- **GIVEN** user naturally explores the demo
- **WHEN** discovery conditions are met (usage thresholds, node visits, etc.)
- **THEN** new lenses unlock without explicit user action
- **AND** notifications celebrate discovery
