# Scale Navigator — Claude Code configuration

## Project context
A local tool for navigating a personal "second brain" corpus across powers of ten, the way Spore zooms from cell to
space. Agents keep up with the human's non-linear thinking through explicit consent (viewframes handed to them,
beacons the human drops, traces the human may engage), never through surveillance.

Source of truth: `openspec/`. The active change is `openspec/changes/rebuild-as-scale-navigator/`.
Status: **Phase A (spec and design system)**. No implementation choices are made until the open decisions in its
`design.md` are resolved by the human. The bookmark app, TUI demos and bookmark-era commands, skills and plugins are
slated for deletion in Phase B (task B0) and should not be extended.

## Agent workflow: OpenSpec as the contract, cheapest capable model per job
Specs let every agent read a small, precise slice instead of the whole conversation. Route work like this:

| Job | Agent | Model |
|---|---|---|
| "Which requirement covers X?", "what's still open?" | `spec-scout` | haiku |
| Validate a change, fix spec formatting | `spec-validator` | haiku |
| Draft or revise proposals, spec deltas, tasks from decided direction | `spec-author` | sonnet |
| Build exactly one task from an approved change | `task-implementer` | sonnet |
| Check implementation against scenarios | `spec-reviewer` | sonnet |
| Interview the human, make or present decisions, design direction, final synthesis | main session | (strongest) |

Rules for the orchestrator:
1. Ask `spec-scout` before reading spec files yourself; act on its citations.
2. Product and design decisions come from the human. Put the options (with visual exemplars when aesthetic or
   mechanical) in front of them; don't decide silently. Record decisions in the change's `design.md`.
3. After any spec edit, run `spec-validator` before committing.
4. Implementation happens one task at a time: `task-implementer`, then `spec-reviewer`, then commit.
5. Run independent agents in parallel, in the background, with tight briefs that list confirmed decisions.

## Conventions
- Commit messages carry no Claude attribution (see `openspec/project.md`).
- The design-system mockup lives in a Design canvas artifact; its text source is `openspec/changes/rebuild-as-scale-navigator/design-system.md`, and its rules are specified in
  `openspec/changes/rebuild-as-scale-navigator/specs/visual-language/spec.md`.
