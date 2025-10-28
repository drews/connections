# Resource Curator Plugin

A Claude Code plugin that exposes bookmark utilities for external integrations and extensions.

## What Is a Plugin?

Plugins are **extensibility points** - they let other tools, scripts, and future features use your project's functionality. Think of them as an API for your Claude Code workspace.

## What This Plugin Provides

### 1. Metadata Utilities
```javascript
const curator = require('./.claude/plugins/resource-curator');

// Fetch metadata for any URL
const meta = await curator.fetchMetadata('https://react.dev/learn');
console.log(meta.title); // "Learn React"
```

### 2. Duplicate Detection
```javascript
// Check if URL already exists
const dupes = await curator.findSimilar('https://example.com/article');
if (dupes.length > 0) {
  console.log('Similar bookmarks found:', dupes);
}
```

### 3. Search Interface
```javascript
// Search bookmarks programmatically
const results = await curator.search('react hooks');
console.log(`Found ${results.length} bookmarks`);
```

### 4. Collection Management
```javascript
// Create collections from code
const collection = await curator.createCollection({
  name: 'Week 1 Resources',
  tags: ['python', 'basics'],
  autoPopulate: true
});
```

### 5. Export Functions
```javascript
// Export bookmarks in various formats
const markdown = await curator.exportAsMarkdown(collectionId);
const json = await curator.exportAsJSON(collectionId);
const html = await curator.exportAsHTML(collectionId);
```

## Installation

The plugin is automatically available when you have the `.claude/` workspace set up.

```javascript
// In your scripts
const curator = require('./.claude/plugins/resource-curator');
```

## API Reference

### `fetchMetadata(url)`
Extracts title, description, favicon, and type from URL.

**Parameters:**
- `url` (string): The URL to analyze

**Returns:** Promise<Metadata>
```javascript
{
  url: string,
  title: string,
  description: string,
  favicon: string,
  image: string | null,
  type: 'article' | 'video' | 'documentation' | 'website'
}
```

### `findSimilar(url)`
Finds bookmarks similar to the given URL.

**Parameters:**
- `url` (string): URL to check against

**Returns:** Promise<Bookmark[]>

### `search(query, options)`
Searches through all bookmarks.

**Parameters:**
- `query` (string): Search terms
- `options` (object): Optional filters
  - `tags` (string[]): Filter by tags
  - `type` (string): Filter by type
  - `limit` (number): Max results

**Returns:** Promise<Bookmark[]>

### `createCollection(config)`
Creates a new bookmark collection.

**Parameters:**
- `config` (object):
  - `name` (string): Collection name
  - `description` (string): Description
  - `tags` (string[]): Auto-include bookmarks with these tags
  - `autoPopulate` (boolean): Automatically add matching bookmarks

**Returns:** Promise<Collection>

### `exportAsMarkdown(collectionId)`
Exports collection as markdown list.

**Parameters:**
- `collectionId` (number): Collection to export

**Returns:** Promise<string>

```markdown
# Week 1: Python Basics

1. [Python Official Tutorial](https://docs.python.org/3/tutorial/)
   > The official Python tutorial covering basics to advanced

2. [Real Python - Getting Started](https://realpython.com/start/)
   > Comprehensive beginner-friendly guide

...
```

### `exportAsJSON(collectionId)`
Exports collection as structured JSON.

**Returns:** Promise<object>

```json
{
  "name": "Week 1: Python Basics",
  "description": "...",
  "bookmarks": [
    {
      "title": "Python Official Tutorial",
      "url": "https://docs.python.org/3/tutorial/",
      "tags": ["python", "tutorial", "official"]
    }
  ]
}
```

### `exportAsHTML(collectionId)`
Exports collection as styled HTML page.

**Returns:** Promise<string>

## Use Cases

### 1. Browser Extension
```javascript
// In a browser extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveBookmark') {
    curator.fetchMetadata(request.url).then(meta => {
      // Save to extension storage
      // Also sync with main database
    });
  }
});
```

### 2. Slack Bot
```javascript
// Slash command in Slack
app.command('/save-bookmark', async ({ command, ack }) => {
  await ack();

  const url = command.text;
  const meta = await curator.fetchMetadata(url);

  await app.client.chat.postMessage({
    channel: command.channel_id,
    text: `Saved: ${meta.title} 🔖`
  });
});
```

### 3. GitHub Action
```yaml
# .github/workflows/bookmark-readme.yml
name: Update README with bookmarks
on:
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Export bookmarks
        run: |
          node -e "
            const curator = require('./.claude/plugins/resource-curator');
            curator.exportAsMarkdown('recommended-resources').then(md => {
              fs.writeFileSync('BOOKMARKS.md', md);
            });
          "
      - name: Commit changes
        run: |
          git config user.name 'Bookmark Bot'
          git add BOOKMARKS.md
          git commit -m 'Update recommended resources'
          git push
```

### 4. CLI Tool
```javascript
#!/usr/bin/env node
// save-bookmark.js

const curator = require('./.claude/plugins/resource-curator');

const url = process.argv[2];
if (!url) {
  console.error('Usage: save-bookmark <url>');
  process.exit(1);
}

curator.fetchMetadata(url).then(meta => {
  console.log(`Saving: ${meta.title}`);
  // Save to database
}).catch(err => {
  console.error('Failed:', err.message);
});
```

### 5. VS Code Extension
```javascript
// In VS Code extension
vscode.commands.registerCommand('multiverse.saveLink', async () => {
  const url = await vscode.window.showInputBox({
    prompt: 'Enter URL to bookmark'
  });

  if (url) {
    const meta = await curator.fetchMetadata(url);
    vscode.window.showInformationMessage(
      `Saved: ${meta.title} to Multiverse Bookmarks`
    );
  }
});
```

## Future MCP Server

This plugin is designed to eventually become an **MCP (Model Context Protocol) server**, allowing Claude (and other AI assistants) to:

- Access your bookmarks directly
- Suggest resources during conversations
- Auto-bookmark helpful links from chats
- Generate collections based on project needs

## Plugin Philosophy

**Reusable**: Same code everywhere
**Extensible**: Easy to add new functions
**Documented**: Clear API for others
**Future-proof**: Designed for growth

---

**Remember**: Plugins turn your project into a platform. Build it once, use it everywhere! 🚀
