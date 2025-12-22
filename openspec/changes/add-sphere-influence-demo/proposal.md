# Change: Add Sphere of Influence TUI Demo

## Why
The system is evolving into a personal knowledge graph browser. A core insight is that every concept exists simultaneously as a **system** (containing related ideas) and as a **component** (participating in larger contexts). This TUI demo makes that duality visceral through smooth animated transitions between:
- **System frame**: A node viewed as a container—showing what it holds
- **Component frame**: The same node viewed as a participant—showing what holds it

This serves as a conceptual demonstration, a compelling intro to the project, and a foundation for future TUI-based graph navigation.

## What Changes
- Add Ink (React for CLI) as a dependency for TUI rendering
- Create `demos/sphere.js` with animated knowledge graph visualization
- Add `npm run demo` script entry point
- Rich mock knowledge graph data (systems thinking, emergence, complexity concepts)
- Smooth tweening animation between system and component perspectives

## Impact
- Affected specs: New `tui-demo` capability
- Affected code: `demos/sphere.js` (new), `package.json` (scripts + deps)
- No changes to existing backend/frontend functionality
