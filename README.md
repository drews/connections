# 📚 Multiversal Bookmarks

**Stop drowning in resources. Start building a shared future.**

A collaborative bookmarking system for [themultiverse.school](http://themultiverse.school) that demonstrates Claude Code's agentic capabilities while solving a real problem: resource overload.

## 🎯 The Problem

Every day, faculty, students, and admin discover valuable resources:
- 📖 Documentation that finally makes sense
- 🎥 That perfect tutorial video
- 🛠️ Tools that boost productivity
- 📝 Articles worth sharing

But then what? Browser bookmarks? Discord links? Lost forever?

## 💡 The Solution

**One beautiful, collaborative space** where the community builds its shared future through curated knowledge:
- ✨ AI extracts metadata automatically
- 🏷️ Smart tagging and categorization
- 🔍 Actually useful search across everyone's finds
- 📁 Curated collections for courses and topics
- 👥 See what the community values and where we're heading

## 🤖 Claude Code Demo Features

This project showcases all four agentic coding capabilities:

### 1. **Slash Commands** - Instant Productivity
- `/bookmark [url]` - Smart add with AI extraction
- `/find [query]` - Semantic search across all bookmarks
- `/curate [name]` - Create themed collections

### 2. **Specialized Agent** - Autonomous Intelligence
- `bookmark-curator` - Monitors, organizes, and suggests improvements

### 3. **Reusable Skills** - Code Patterns
- Metadata extraction
- Duplicate detection
- Tag suggestions
- Collection builders

### 4. **Plugin System** - Extensibility
- `resource-curator` - Utilities for external integrations

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Open in browser
open http://localhost:3000

# Try a command
/bookmark https://react.dev/learn
```

## 🏗️ Architecture

```
multiversal-bookmarks/
├── .claude/              # Claude Code workspace
│   ├── commands/         # Slash commands
│   ├── agents/          # Autonomous agents
│   ├── skills/          # Reusable patterns
│   └── plugins/         # Extension system
├── backend/             # Express + SQLite API
├── frontend/            # Beautiful Tailwind UI
└── docker-compose.yml   # One-command deploy
```

## 🎓 For Multiverse School

**Faculty**: Create reading lists that shape courses
**Students**: Share discoveries that accelerate learning
**Admin**: Organize knowledge that builds community
**Everyone**: Curate resources that define our shared future

Built with ❤️ for collaborative learning and collective progress
