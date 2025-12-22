# Project Context

## Purpose
Multiversal Bookmarks is a collaborative bookmarking system for themultiverse.school community. It helps faculty, students, and administrators share resources and build collective knowledge toward a shared future. The system enables:
- Saving and organizing web resources with automatic metadata extraction
- Tagging bookmarks for categorization and discovery
- Creating curated collections of related bookmarks
- Searching across all saved resources

## Tech Stack
- **Runtime**: Node.js
- **Backend**: Express.js (REST API)
- **Database**: SQLite (file-based, portable)
- **Frontend**: Vanilla JavaScript + Tailwind CSS
- **Scraping**: Cheerio + node-fetch (metadata extraction)
- **Deployment**: Docker Compose (fits campus-quest-infra)

## Project Conventions

### Code Style
- JavaScript (ES6+), no TypeScript
- CommonJS modules (`require`/`module.exports`)
- Async/await for asynchronous operations
- Class-based patterns for database layer
- Descriptive console logging with emoji prefixes for visibility

### Architecture Patterns
- **Layered architecture**: Separation of concerns between API routes (`server.js`), data access (`database.js`), and utilities (`metadata.js`)
- **RESTful API**: Standard HTTP methods and JSON responses
- **Promise-based database**: SQLite operations wrapped in Promises for async/await usage
- **Static file serving**: Frontend served directly from Express
- **Claude Code integration**: Custom slash commands, agents, and skills in `.claude/` directory

### Testing Strategy
- Manual testing via API endpoints and frontend UI
- Script-based utilities for bulk operations (`import-bookmarks.js`, `test-plugin.js`)
- No formal test framework currently configured

### Git Workflow
- Single `main` branch
- Clean commit history
- Commit messages without Claude attribution (per user preference)

## Domain Context
- **Bookmarks**: Web resources with URL, title, description, favicon, and preview image
- **Tags**: Categorization labels that can be applied to multiple bookmarks
- **Collections**: Curated groupings of bookmarks with ordering support
- **Users**: Simple `added_by` tracking (no authentication system)
- **Community focus**: Designed for educational resource sharing within a school community

## Important Constraints
- **Simplicity first**: Vanilla JS over frameworks, SQLite over complex databases
- **Portability**: Must work as a self-contained Docker deployment
- **No authentication**: Trust-based community model (may change)
- **Claude Code friendly**: Project designed for AI-assisted development with slash commands and agents

## External Dependencies
- **URL metadata**: Fetched dynamically from target websites via HTTP requests
- **Favicons**: Retrieved from Google's favicon service or site directly
- **No external APIs**: Self-contained system with no third-party service dependencies
