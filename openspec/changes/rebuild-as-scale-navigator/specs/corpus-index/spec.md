## ADDED Requirements

### Requirement: Normalized Nested Item Store
The index SHALL store every ingested source as nested items with a common shape (id, source, kind, parent, title, text, created, updated, meta), in a local SQLite database with full-text search, independent of any user interface.

#### Scenario: Clients depend on the index, not the reverse
- **WHEN** the canvas or an agent needs corpus data
- **THEN** it reads through the index query API
- **AND** the index package imports nothing from the canvas or membrane packages

#### Scenario: Full-text query
- **WHEN** a query includes a text term
- **THEN** matching items are returned with their ancestor chain

### Requirement: Claude Code Transcript Ingestion
The index SHALL ingest Claude Code local transcripts (`~/.claude/projects/*/*.jsonl`) into the nesting project → session → turn → step.

#### Scenario: Turn segmentation
- **WHEN** a session contains several user prompts
- **THEN** each prompt and the assistant activity up to the next prompt form one turn
- **AND** assistant text, tool calls and tool results become steps under that turn

#### Scenario: Subagent sidechains
- **WHEN** records are marked `isSidechain`
- **THEN** they nest under the turn that spawned them and are not separate turns

#### Scenario: Incremental re-ingest
- **WHEN** a transcript file grows while a session is live
- **THEN** only the appended records are read and indexed

### Requirement: Staged Source Roadmap
The index SHALL add sources through pluggable adapters in this order: Claude Code transcripts, Obsidian vault, then bookmarks, web clips and raw stream capture.

#### Scenario: Adding an adapter
- **WHEN** a new adapter is registered
- **THEN** its items appear in queries without changes to the canvas
