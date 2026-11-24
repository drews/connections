## ADDED Requirements

### Requirement: Frame-Scoped Agent Access
An agent SHALL be able to read only the items inside the viewframes the user has granted to it.

#### Scenario: Ungranted item
- **WHEN** an agent requests an item outside all of its granted frames
- **THEN** the request is refused and the item's existence is not revealed

#### Scenario: Revoking a grant
- **WHEN** the user revokes a frame from an agent
- **THEN** the agent can no longer read items that only that frame covered

### Requirement: Declared Presence via Beacons
The system SHALL share the user's whereabouts with agents only through beacons the user explicitly drops, never by inferring from activity.

#### Scenario: Beacon inside a granted frame
- **WHEN** the user drops a beacon at a location inside an agent's granted frame
- **THEN** that agent can read the beacon's location and message

#### Scenario: Beacon outside grants
- **WHEN** a beacon lies outside every frame granted to an agent
- **THEN** that agent cannot see it

#### Scenario: No implicit tracking
- **WHEN** the user navigates without dropping a beacon
- **THEN** no navigation, keystroke or dwell data is available to agents

### Requirement: Insights as Opt-in Ambient Traces
Agents SHALL surface mined insights only as traces (sparkle, soapstone mark, or strand), and SHALL NOT place content-shaped cards in the user's space.

#### Scenario: Sparkle
- **WHEN** an agent leaves a sparkle on an item
- **THEN** the item shimmers subtly and reveals the insight only when the user investigates it

#### Scenario: Soapstone mark
- **WHEN** an agent leaves a soapstone mark
- **THEN** its short message is legible only when the user zooms close, and the user may appraise it

#### Scenario: Strand
- **WHEN** an agent proposes that two distant items are related
- **THEN** a strand bridges them, which the user may traverse, keep, or let decay

#### Scenario: No ghost cards
- **WHEN** an agent attempts to add a card, note or item to the user's space
- **THEN** the system refuses it

### Requirement: Insight Layer Opt-in
The insight layer SHALL be off until the user turns it on, and the user SHALL be able to control it globally and per agent.

#### Scenario: Default state
- **WHEN** a user has not enabled the insight layer
- **THEN** no traces render

#### Scenario: Opting out of one agent
- **WHEN** the insight layer is off for an agent
- **THEN** none of that agent's traces render while other agents' traces still do

### Requirement: Engagement as the Only Feedback
The only signal agents SHALL receive about the user's response to traces is explicit engagement: reveal, appraise, traverse, keep.

#### Scenario: Ignored trace
- **WHEN** the user never engages a trace
- **THEN** it decays, and the agent learns only that it was not engaged

#### Scenario: Passive viewing
- **WHEN** a trace is merely on screen without engagement
- **THEN** no signal is sent to the agent
