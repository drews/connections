## ADDED Requirements

### Requirement: Viewframe as Perspective Card
A viewframe SHALL be a card that holds a query, a ladder, a layout and an entry scale, and SHALL be placeable on the canvas like any other card.

#### Scenario: Same corpus, different ladders
- **GIVEN** two viewframes over the same query, one with the Work ladder and one with the Time ladder
- **WHEN** the user zooms into each
- **THEN** the same items are grouped by project/session in one and by year/month/day in the other

### Requirement: Portal Mode
A viewframe SHALL act as a portal: zooming into it enters the world its query and ladder produce.

#### Scenario: Entering a portal
- **WHEN** the user zooms into a portal viewframe past its entry scale
- **THEN** the canvas renders the frame's world, and surfacing returns to the outer world

### Requirement: Magic Lens Mode
A viewframe SHALL act as a magic lens: when dragged over the canvas, the items beneath it are re-rendered through the frame's query or ladder while the rest of the canvas is unchanged.

#### Scenario: Lens over a region
- **WHEN** the user drags a lens viewframe over a project region
- **THEN** items under the lens are filtered or regrouped by the lens
- **AND** items outside the lens keep their normal rendering

### Requirement: Saved Frames and Paths
A viewframe SHALL be savable as a named place (position, scale, query) and chainable into a path the user can step through.

#### Scenario: Returning to a frame
- **WHEN** the user selects a saved frame
- **THEN** the camera flies to that place and scale with its query applied
