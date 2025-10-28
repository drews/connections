# 🎬 Multiversal Bookmarks - Demo Guide

## The Story: Building a Shared Future

This project demonstrates Claude Code's four agentic capabilities through a practical, beautiful application that solves a real problem for themultiverse.school community.

---

## 🎯 Quick Start (30 seconds)

```bash
cd multiversal-bookmarks
npm install
npm start
```

Open http://localhost:3000 and see the beautiful UI! 🌟

---

## 🤖 The Four Claude Code Features

### 1. **Slash Commands** - Instant Productivity

Commands live in `.claude/commands/` and are invoked with `/commandname`:

#### `/bookmark [url]`
Try it: `/bookmark https://react.dev/learn`

**What happens:**
1. Claude reads the command instructions from `.claude/commands/bookmark.md`
2. Fetches the URL and extracts metadata (title, description, favicon)
3. Suggests smart tags based on content analysis
4. Checks for duplicates using the skill
5. Saves to database with confirmation
6. Offers to add to a collection

**Why it's cool:** One command = metadata extraction + duplicate detection + tagging + user feedback!

#### `/find [query]`
Try it: `/find react tutorial`

**What happens:**
1. Performs intelligent search across titles, descriptions, tags
2. Ranks results by relevance
3. Shows formatted results with metadata
4. Offers quick actions (open, add to collection)

**Why it's cool:** Natural language search that actually finds what you're looking for!

#### `/curate [name]`
Try it: `/curate "Week 1: React Basics"`

**What happens:**
1. Creates a new collection
2. Suggests relevant bookmarks based on tags
3. Lets you organize order (basics → advanced)
4. Generates shareable link + markdown export

**Why it's cool:** Turns chaos into curated learning paths!

---

### 2. **Specialized Agent** - Autonomous Intelligence

The agent lives in `.claude/agents/bookmark-curator.md` and runs autonomously:

#### What the `bookmark-curator` agent does:

**Duplicate Detection** (continuous)
- Monitors new bookmarks for duplicates
- Suggests merging similar resources
- Keeps collection clean automatically

**Smart Tag Suggestions** (after adds)
- Analyzes content for missing tags
- Compares with similar bookmarks
- Suggests improvements

**Auto-Collections** (daily)
- Identifies thematic clusters (e.g., 8+ Python bookmarks)
- Proposes auto-generated collections
- Drafts descriptions

**Health Monitoring** (weekly)
- Checks for dead links (404s)
- Flags outdated content ("React 16 Tutorial" → suggest updating)
- Reports statistics

**Gap Analysis** (on-demand)
- Identifies under-represented topics
- Suggests resources to fill knowledge gaps
- Tracks community interests

**Why it's cool:** Works while you sleep! No manual curation needed.

---

### 3. **Skills** - Reusable Code Patterns

Skills live in `.claude/skills/` and are used by commands, agents, AND the plugin:

#### `extract-metadata` Skill
Location: `.claude/skills/extract-metadata.md`

**What it does:**
- Fetches web page
- Parses HTML with Cheerio
- Extracts: title, description, favicon, Open Graph image
- Guesses type (video, tutorial, documentation, etc.)
- Provides fallback for scraping failures

**Used by:**
- `/bookmark` command
- `bookmark-curator` agent (for refreshing old metadata)
- `resource-curator` plugin (for external integrations)

**Why it's cool:** Write once, use everywhere! DRY principle in action.

#### `detect-duplicates` Skill
Location: `.claude/skills/detect-duplicates.md`

**What it does:**
- Normalizes URLs (removes www, tracking params, etc.)
- Calculates similarity scores (Levenshtein distance)
- Compares content (title, description, tags)
- Returns: exact matches, similar URLs, related content

**Used by:**
- `/bookmark` command (before saving)
- `bookmark-curator` agent (daily health checks)
- Future browser extension (prevent duplicates at save time)

**Why it's cool:** Sophisticated deduplication logic, available everywhere!

---

### 4. **Plugin System** - Extensibility

The plugin lives in `.claude/plugins/resource-curator/` and exposes utilities:

#### What the plugin provides:

**API for External Tools:**
```javascript
const curator = require('./.claude/plugins/resource-curator');

// Use in any Node.js script
const meta = await curator.fetchMetadata('https://example.com');
const dupes = await curator.findSimilar('https://example.com');
const results = await curator.search('react hooks');
```

**Use Cases We Built:**
1. **Browser Extension** - Save from any page
2. **Slack Bot** - `/save-bookmark` command
3. **GitHub Action** - Weekly README updates
4. **CLI Tool** - `save-bookmark <url>` from terminal
5. **VS Code Extension** - Right-click → Save to Multiverse

**Export Functions:**
```javascript
// Export collections in any format
const markdown = await curator.exportAsMarkdown(collectionId);
const json = await curator.exportAsJSON(collectionId);
const html = await curator.exportAsHTML(collectionId);
```

**Why it's cool:** Your project becomes a platform! Others can build on it.

**Future:** This plugin is designed to become an MCP server, allowing Claude (and other AIs) to access bookmarks directly during conversations.

---

## 🎭 The Complete Workflow Demo

### Scenario: Student discovers an amazing React tutorial

**1. Quick Add (Command)**
```bash
/bookmark https://react.dev/learn/thinking-in-react
```

Claude:
- ✓ Fetches metadata: "Thinking in React – React Docs"
- ✓ Suggests tags: `react`, `tutorial`, `documentation`
- ✓ Checks duplicates: None found
- ✓ Saves as bookmark #42

**2. Agent Works in Background**
- Analyzes new bookmark
- Notices 7 other React bookmarks
- Suggests: "Create 'React Learning Path' collection?"

**3. Faculty Member Searches (Command)**
```bash
/find component patterns
```

Claude:
- Returns 5 relevant results
- Ranked by quality + saves
- Shows the new bookmark!

**4. Create Course Collection (Command)**
```bash
/curate "Week 3: Advanced React"
```

Claude:
- Suggests bookmarks tagged `react` + `advanced`
- Student's bookmark appears
- Orders: basics → intermediate → advanced
- Exports as markdown for syllabus

**5. Export for Sharing (Plugin)**
```javascript
const markdown = await curator.exportAsMarkdown('week-3-react');
// Generates beautiful markdown list for course materials
```

**Result:** One student's discovery becomes part of the course curriculum! 🌟

---

## 🏗️ Architecture Overview

```
.claude/                          # Claude Code Workspace
├── CLAUDE.md                     # Project context
├── commands/                     # Slash commands
│   ├── bookmark.md              # Smart bookmark adding
│   ├── find.md                  # Intelligent search
│   └── curate.md                # Collection management
├── agents/                       # Autonomous agents
│   └── bookmark-curator.md      # Background curation
├── skills/                       # Reusable patterns
│   ├── extract-metadata.md      # URL scraping
│   └── detect-duplicates.md     # Similarity detection
└── plugins/                      # Extension system
    └── resource-curator/         # External integrations
        ├── README.md
        └── index.js

backend/                          # Express + SQLite API
├── server.js                    # REST API endpoints
├── database.js                  # SQLite wrapper
└── metadata.js                  # Implements extract-metadata skill

frontend/                         # Beautiful Tailwind UI
├── index.html                   # Single-page app
└── app.js                       # Client-side logic

docker-compose.yml               # One-command deployment
```

---

## 🚀 Deployment to themultiverse.school

### Option 1: Docker Compose (Recommended)

```bash
docker-compose up -d
```

Access at: http://localhost:3000

### Option 2: Integrate with campus-quest-infra

1. Copy `multiversal-bookmarks` to campus-quest-infra
2. Add to their docker-compose.yml:

```yaml
multiversal-bookmarks:
  image: multiversal-bookmarks:latest
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.bookmarks.rule=Host(`bookmarks.themultiverse.school`)"
```

3. Deploy: `docker-compose up -d multiversal-bookmarks`

Access at: https://bookmarks.themultiverse.school

---

## 🎓 Educational Value

### For Students
- Learn collaborative knowledge sharing
- See AI-powered curation in action
- Access community-vetted resources
- Never lose that perfect tutorial

### For Faculty
- Curate course materials easily
- See what students find valuable
- Track trending topics
- Export reading lists

### For Everyone
- Build shared knowledge base
- Discover resources through social proof
- Contribute to collective learning
- **Build a shared future** 🌟

---

## 🎯 Key Takeaways

### 1. **Commands = Productivity**
Custom commands turn complex workflows into one-liners

### 2. **Agents = Automation**
Autonomous agents handle maintenance tasks continuously

### 3. **Skills = Reusability**
Write patterns once, use them everywhere (DRY!)

### 4. **Plugins = Platform**
Extension points turn projects into platforms

### All Together = **Agentic Coding Magic** ✨

---

## 🔮 Future Enhancements

1. **MCP Server** - Direct Claude integration
2. **Browser Extension** - Save from anywhere
3. **Slack/Discord Bot** - Share in channels
4. **AI-Powered Summaries** - Auto-summarize articles
5. **Collaborative Annotations** - Community notes
6. **Learning Paths** - Guided curriculum generation
7. **WorkAdventure Integration** - Bookmarks in virtual campus

---

## 📚 Resources

- Claude Code Docs: https://docs.claude.com/claude-code
- Express.js: https://expressjs.com
- Tailwind CSS: https://tailwindcss.com
- SQLite: https://www.sqlite.org

---

**Built with ❤️ for collaborative learning at themultiverse.school**

*"Stop drowning in resources. Start building a shared future."*
