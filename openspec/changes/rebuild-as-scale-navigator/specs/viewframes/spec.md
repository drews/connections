## ADDED Requirements

### Requirement: Viewframe as Perspective Card
A viewframe SHALL be a card that holds a query, a ladder, a layout and an entry scale, and SHALL be placeable on the canvas like any other card.

#### Scenario: Same corpus, different ladders
- **GIVEN** two viewframes over the same query, one with the Work ladder and one with the Time ladder
- **WHEN** the user zooms into each
- **THEN** the same items are grouped by project/session in one and by year/month/day in the other

### Requirement: Ladders as Viewframes
The Work, Time and Idea ladders SHALL each be expressed as ordinary viewframes, not as special modes.

#### Scenario: Switching ladder
- **WHEN** the user opens a Time viewframe instead of a Work viewframe
- **THEN** no mode switch occurs; the user is simply inside a different frame

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

#### Scenario: Stepping a path
- **WHEN** the user advances along a path
- **THEN** the camera moves to the next saved frame in order

### Requirement: Nested Viewframes
Viewframes SHALL be nestable: a viewframe may appear as a card inside another viewframe's world, and nested frames are scoped by their enclosing frame.

#### Scenario: Frame inside a frame
- **WHEN** a viewframe is placed inside another
- **THEN** it can be entered as a portal from within the outer world
- **AND** its results are limited to what the outer frame also includes

### Requirement: Handing a Viewframe to an Agent
The user SHALL be able to hand a viewframe to an agent, which grants that agent access to exactly the items the frame covers, as defined in agent-membrane.

#### Scenario: Handing over
- **WHEN** the user hands a viewframe to an agent
- **THEN** the agent can read the items inside that frame, and a nested frame grants only its own scope
