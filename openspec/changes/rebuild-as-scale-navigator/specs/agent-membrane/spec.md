## ADDED Requirements

### Requirement: Frame-Scoped Agent Access
An agent SHALL be able to read only the items inside the viewframes the user has granted to it.

#### Scenario: Ungranted item
- **WHEN** an agent requests an item outside all of its granted frames
- **THEN** the request is refused and the item's existence is not revealed

### Requirement: Declared Presence via Beacons
The system SHALL share the user's whereabouts with agents only through beacons the user explicitly drops, never by inferring from activity.

#### Scenario: Beacon inside a granted frame
- **WHEN** the user drops a beacon at a location inside an agent's granted frame
- **THEN** that agent can read the beacon's location and message

#### Scenario: No implicit tracking
- **WHEN** the user navigates without dropping a beacon
- **THEN** no navigation, keystroke or dwell data is sent to the server or agents

### Requirement: Insights as Opt-in Ambient Traces
Agents SHALL surface mined insights only as traces (sparkle, soapstone mark, or strand), and SHALL NOT place content cards in the user's space.

#### Scenario: Sparkle
- **WHEN** an agent leaves a sparkle on an item
- **THEN** the item shimmers subtly and reveals the insight only when the user investigates it

#### Scenario: Soapstone mark
- **WHEN** an agent leaves a soapstone mark
- **THEN** its short message is legible only when the user zooms close, and the user may appraise it

#### Scenario: Strand
- **WHEN** an agent proposes that two distant items are related
- **THEN** a strand bridges them, which the user may traverse, keep, or let decay

#### Scenario: Opting out
- **WHEN** the insight layer is off, globally or for an agent
- **THEN** none of that agent's traces render

### Requirement: Engagement as the Only Feedback
The only signal agents SHALL receive about the user's response to traces is explicit engagement: reveal, appraise, traverse, keep.

#### Scenario: Ignored trace
- **WHEN** the user never engages a trace
- **THEN** it decays, and the agent learns only that it was not engaged
