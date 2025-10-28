# Multiversal Bookmarks - Claude Code Configuration

## Project Context
Collaborative bookmarking system for themultiverse.school community. Helps faculty, students, and admin share resources and build collective knowledge toward a shared future.

## Tech Stack
- **Backend**: Express.js + SQLite (simple, portable)
- **Frontend**: Vanilla JS + Tailwind CSS (fast, beautiful)
- **Data**: SQLite for bookmarks, tags, collections
- **Deploy**: Docker Compose (fits campus-quest-infra)

## Database Schema
```sql
bookmarks (id, url, title, description, favicon, added_by, created_at)
tags (id, name, color)
bookmark_tags (bookmark_id, tag_id)
collections (id, name, description, created_by)
collection_bookmarks (collection_id, bookmark_id, position)
```

## Claude Code Features

### Slash Commands (`.claude/commands/`)
- `/bookmark` - Add bookmark with AI metadata extraction
- `/find` - Semantic search across bookmarks
- `/curate` - Create themed collections

### Agents (`.claude/agents/`)
- `bookmark-curator` - Autonomous curation and organization

### Skills (`.claude/skills/`)
- `extract-metadata` - Fetch URL metadata (title, description, favicon)
- `detect-duplicates` - Find similar existing bookmarks
- `suggest-tags` - AI-powered categorization
- `build-collection` - Collection templates

### Plugins (`.claude/plugins/`)
- `resource-curator` - Reusable utilities for bookmark operations

## Development Workflow
1. Use commands for quick operations
2. Agent runs in background for curation
3. Skills provide reusable patterns
4. Plugin exposes utilities for extensions

## Key Files
- `backend/server.js` - Express API
- `backend/database.js` - SQLite setup
- `backend/metadata.js` - URL scraping
- `frontend/index.html` - Main UI
- `frontend/app.js` - Client-side logic
