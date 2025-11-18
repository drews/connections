# Multiversal Bookmarks - Cross-Platform Architecture

## 🎯 Vision
Build a unified bookmarking experience across CLI, Web, and Desktop with neural network-inspired visualizations using Cytoscape.js and a portable JS/TS stack.

## 🏗️ Tech Stack Evolution

### Current (v1.0)
```
Backend:   Express.js + SQLite
Frontend:  Vanilla JS + Tailwind CSS
Deploy:    Docker Compose
```

### Target (v2.0) - Option A: Pragmatic JavaScript Stack
```
CLI:       Ink (React TUI) + Node.js
Web:       React + Cytoscape.js + Tailwind CSS
Desktop:   Tauri 2.0 + React
Mobile:    PWA (Progressive Web App)
Backend:   Express.js + SQLite (unchanged)
Deploy:    Docker Compose + Tauri bundles
```

## 📦 Project Structure (Target)

```
connections/
├── backend/              # Express.js API (unchanged)
│   ├── server.js
│   ├── database.js
│   └── metadata.js
│
├── shared/               # NEW: Shared utilities & types
│   ├── api/             # API client for all platforms
│   │   └── client.ts
│   ├── types/           # TypeScript definitions
│   │   └── index.ts
│   └── utils/           # Shared logic
│       └── graph.ts     # Cytoscape graph utilities
│
├── web/                  # NEW: React web app
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookmarkCard.tsx
│   │   │   ├── GraphView.tsx      # Cytoscape.js neural network viz
│   │   │   ├── ListView.tsx        # Traditional list view
│   │   │   ├── Sidebar.tsx
│   │   │   └── Modals/
│   │   ├── hooks/
│   │   │   ├── useBookmarks.ts
│   │   │   ├── useTags.ts
│   │   │   └── useGraph.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── cli/                  # NEW: Ink CLI app
│   ├── src/
│   │   ├── commands/
│   │   │   ├── list.tsx
│   │   │   ├── add.tsx
│   │   │   ├── search.tsx
│   │   │   └── graph.tsx       # ASCII graph view
│   │   ├── components/
│   │   │   ├── BookmarkList.tsx
│   │   │   ├── SearchBox.tsx
│   │   │   └── GraphASCII.tsx  # Terminal graph viz
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── desktop/              # NEW: Tauri wrapper
│   ├── src-tauri/
│   │   ├── Cargo.toml
│   │   ├── tauri.conf.json
│   │   └── src/
│   │       └── main.rs
│   └── package.json      # Points to ../web
│
├── frontend/             # LEGACY: Keep for reference, deprecate later
├── .claude/              # Claude Code config
├── docker-compose.yml
└── package.json          # Root workspace config
```

## 🔄 Migration Strategy

### Phase 1: Foundation (Week 1)
- [x] Research TUI libraries and web equivalents
- [ ] Set up monorepo structure with workspaces
- [ ] Create `shared/` package for common code
- [ ] Add TypeScript to project
- [ ] Set up build tooling (Vite for web, tsup for shared)

### Phase 2: Web App with Graph View (Week 2)
- [ ] Create React app with Vite
- [ ] Migrate components from Vanilla JS to React
- [ ] Integrate Cytoscape.js for graph visualization
- [ ] Add view toggle: List ↔ Graph
- [ ] Port Tailwind styling
- [ ] Implement all existing features

### Phase 3: CLI with Ink (Week 3)
- [ ] Set up Ink project
- [ ] Build interactive bookmark manager
- [ ] Create ASCII graph visualization
- [ ] Add commands: list, add, search, graph
- [ ] Publish to npm (optional)

### Phase 4: Desktop with Tauri (Week 4)
- [ ] Initialize Tauri project
- [ ] Configure to use web/ as frontend
- [ ] Add desktop-specific features (system tray, notifications)
- [ ] Build and test on macOS/Windows/Linux
- [ ] Create installers

### Phase 5: Polish & Deploy (Week 5)
- [ ] PWA configuration for mobile
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] CI/CD for all platforms
- [ ] Release v2.0

## 🎨 Neural Network Visualization Design

### Graph View Components

```typescript
// Cytoscape.js Configuration
const cytoscapeConfig = {
  layout: {
    name: 'cose',           // Force-directed: organic, neural-like
    animate: true,
    nodeDimensionsIncludeLabels: true
  },
  style: [
    {
      selector: 'node',
      style: {
        'background-color': '#4F46E5',  // Indigo
        'label': 'data(title)',
        'width': 'mapData(connections, 1, 10, 40, 80)',
        'height': 'mapData(connections, 1, 10, 40, 80)',
        'font-size': '12px',
        'text-valign': 'center',
        'text-halign': 'center',
        'overlay-opacity': 0.2
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#94A3B8',  // Slate
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.5
      }
    },
    {
      selector: 'node:selected',
      style: {
        'background-color': '#EC4899',  // Pink - highlight
        'border-width': 3,
        'border-color': '#BE185D'
      }
    }
  ]
}
```

### Graph Relationships

**Nodes:** Each bookmark is a node
**Edges:** Connections based on:
1. Shared tags (weighted by tag overlap)
2. Same collection membership
3. Similar domains (same website)
4. Temporal proximity (added within X days)

### ASCII Graph (CLI)

```
Terminal View using box-drawing characters:

     ┌─────────┐
     │ React   │
     │ Docs    │
     └────┬────┘
          │
     ┌────┴────┬────────┐
     │         │        │
  ┌──▼──┐  ┌──▼──┐  ┌──▼──┐
  │Hooks│  │JSX  │  │State│
  └─────┘  └─────┘  └─────┘

Tags: [react] [docs] [tutorial]
```

## 🔌 API Integration

### Shared API Client

```typescript
// shared/api/client.ts
export class BookmarksAPI {
  constructor(private baseURL: string) {}

  async getBookmarks(): Promise<Bookmark[]> {
    const res = await fetch(`${this.baseURL}/api/bookmarks`);
    return res.json();
  }

  async createBookmark(data: CreateBookmarkInput): Promise<Bookmark> {
    const res = await fetch(`${this.baseURL}/api/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }

  // ... other methods
}

// Usage across platforms:
// Web:     const api = new BookmarksAPI('http://localhost:3000')
// CLI:     const api = new BookmarksAPI(process.env.API_URL || 'http://localhost:3000')
// Desktop: const api = new BookmarksAPI('http://localhost:3000') // or Tauri bridge
```

## 🎯 Feature Parity Matrix

| Feature                  | Web | CLI | Desktop | Mobile |
|--------------------------|-----|-----|---------|--------|
| List bookmarks           | ✅  | ✅  | ✅      | ✅     |
| Add bookmark             | ✅  | ✅  | ✅      | ✅     |
| Search                   | ✅  | ✅  | ✅      | ✅     |
| Graph view               | ✅  | ⚡  | ✅      | ✅     |
| Collections              | ✅  | ✅  | ✅      | ✅     |
| Tags                     | ✅  | ✅  | ✅      | ✅     |
| Offline mode             | 🔄  | ❌  | ✅      | 🔄     |
| System notifications     | 🔄  | ❌  | ✅      | 🔄     |
| Keyboard shortcuts       | ✅  | ✅  | ✅      | ❌     |
| Export/Import            | ✅  | ✅  | ✅      | ✅     |

Legend: ✅ Full support | ⚡ ASCII version | 🔄 PWA feature | ❌ Not applicable

## 📚 Key Dependencies

### Web
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "cytoscape": "^3.30.0",
  "cytoscape-cose-bilkent": "^4.1.0",
  "@tanstack/react-query": "^5.0.0",
  "tailwindcss": "^3.4.0"
}
```

### CLI
```json
{
  "ink": "^5.0.0",
  "react": "^18.3.1",
  "ink-text-input": "^6.0.0",
  "ink-select-input": "^6.0.0",
  "chalk": "^5.3.0",
  "commander": "^12.0.0"
}
```

### Desktop
```json
{
  "@tauri-apps/api": "^2.0.0",
  "@tauri-apps/cli": "^2.0.0"
}
```

### Shared
```json
{
  "typescript": "^5.5.0",
  "zod": "^3.23.0"
}
```

## 🚀 Getting Started (Post-Migration)

```bash
# Install all dependencies
npm install

# Development
npm run dev:web       # Start web dev server (Vite)
npm run dev:cli       # Run CLI in watch mode
npm run dev:all       # Backend + Web concurrently

# Build
npm run build:web     # Build web app
npm run build:cli     # Build CLI executable
npm run build:desktop # Build Tauri desktop apps

# Desktop
npm run tauri dev     # Run desktop app in dev mode
npm run tauri build   # Build desktop installers
```

## 🎨 Design Philosophy

### Visual Language
- **Colors**: Indigo/Blue gradient (consistent with current branding)
- **Neural Aesthetic**: Organic, flowing connections between nodes
- **Minimalism**: Clean, focused interfaces across all platforms
- **Consistency**: Same mental model (bookmarks → nodes, tags → clusters)

### Interaction Patterns
- **Web/Desktop**: Click, drag, zoom graph; keyboard shortcuts
- **CLI**: Vim-style navigation, fuzzy search
- **Mobile**: Touch gestures, pinch-to-zoom on graph

## 📈 Performance Targets

- **Web**: First Contentful Paint < 1.5s
- **Graph**: Smooth at 1000+ nodes (use clustering for larger datasets)
- **CLI**: Response time < 100ms
- **Desktop**: Bundle size < 10MB (Tauri advantage)

## 🔐 Security Considerations

- **Tauri**: Rust security by default, no Node.js in production
- **API**: CORS properly configured
- **Data**: SQLite file permissions
- **Secrets**: Environment variables, never committed

## 📝 Notes

- Backend remains **unchanged** - all platforms consume same Express API
- Gradual migration: v1 (Vanilla JS) stays until v2 (React) is feature-complete
- CLI can be standalone npm package: `npx multiversal-bookmarks`
- Desktop bundles are tiny (~3MB) thanks to Tauri + OS WebView
- Graph visualization is the **killer feature** - prioritize in v2
