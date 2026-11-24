## ADDED Requirements

### Requirement: Normalized Nested Items
The index SHALL represent every ingested source as nested items sharing a common shape (identity, source, kind, parent, title, text, created time, updated time, project, metadata), independent of any user interface.

#### Scenario: Clients depend on the index, not the reverse
- **WHEN** the canvas or an agent needs corpus data
- **THEN** it obtains it through the index's query interface
- **AND** the index requires neither the canvas nor agents to function

#### Scenario: Full-text query
- **WHEN** a query includes a text term
- **THEN** matching items are returned with their ancestor chain

### Requirement: Provenance and Open-at-Origin
Every item SHALL retain provenance identifying its source file and record, so that any item can be opened at its origin.

#### Scenario: Opening a turn at its origin
- **WHEN** the user asks to open an item
- **THEN** the system presents or locates the originating file and record

#### Scenario: Origin moved or deleted
- **WHEN** the origin no longer exists
- **THEN** the item shows its provenance and states that the origin is unavailable

### Requirement: Ladder Metadata
Every item SHALL carry created and updated times and its project, so that Work and Time ladders can group it without further lookup.

#### Scenario: Time grouping
- **WHEN** a Time ladder groups items by day
- **THEN** each item appears under the day of its created time

#### Scenario: Work grouping
- **WHEN** a Work ladder groups items
- **THEN** each item appears under its project

### Requirement: Claude Code Transcript Ingestion
The index SHALL ingest Claude Code local transcripts into the nesting project → session → turn → step.

#### Scenario: Turn segmentation
- **WHEN** a session contains several user prompts
- **THEN** each prompt and the assistant activity up to the next prompt form one turn
- **AND** assistant text, tool calls and tool results become steps under that turn

#### Scenario: Subagent work
- **WHEN** records are marked as sidechain (subagent) work
- **THEN** they nest under the turn that spawned them and are not separate turns

#### Scenario: Rewound branches
- **WHEN** a session contains records that were rewound or branched
- **THEN** those records remain reachable and are marked as an alternate branch

#### Scenario: Live session growth
- **WHEN** a transcript grows while a session is live
- **THEN** only the new records are added and existing items are unchanged

### Requirement: Staged Source Roadmap
The index SHALL add sources through interchangeable adapters in this order: Claude Code transcripts, Obsidian vault, then bookmarks, web clips and raw capture.

#### Scenario: Adding an adapter
- **WHEN** a new adapter is registered
- **THEN** its items appear in queries without changes to the canvas

### Requirement: User-Controlled Exclusion
The user SHALL be able to mark individual items or whole sources as excluded, and excluded items SHALL NOT appear in query results, on the canvas, or to any agent.

#### Scenario: Excluding a source
- **WHEN** the user excludes a source
- **THEN** none of its items are returned to any client

#### Scenario: Reversing exclusion
- **WHEN** the user removes an exclusion
- **THEN** the items become available again

### Requirement: Local and Offline Operation
The index SHALL ingest, store and query without network access, and SHALL keep all data on the user's machine.

#### Scenario: No network
- **WHEN** the machine is offline
- **THEN** ingestion and queries work normally
