# Migration Guide: Vanilla JS → React + Cytoscape.js

## 🎯 Goal
Transform Multiversal Bookmarks from Vanilla JS to a modern React + Cytoscape.js stack while maintaining all existing functionality and adding neural network graph visualization.

## 📋 Prerequisites

- [x] Research completed (Cytoscape.js chosen)
- [x] Architecture designed (Option A: JS/TS Stack)
- [ ] Stakeholder buy-in
- [ ] Backup current working version

## 🔄 Migration Steps

### Step 1: Set Up Monorepo Structure

#### 1.1 Create Workspace Package.json

```bash
# Update root package.json to use workspaces
```

**Root package.json changes:**
```json
{
  "name": "multiversal-bookmarks",
  "version": "2.0.0",
  "private": true,
  "workspaces": [
    "backend",
    "shared",
    "web",
    "cli"
  ],
  "scripts": {
    "dev:backend": "npm run dev --workspace=backend",
    "dev:web": "npm run dev --workspace=web",
    "dev:cli": "npm run dev --workspace=cli",
    "dev:all": "concurrently \"npm:dev:backend\" \"npm:dev:web\"",
    "build:all": "npm run build --workspaces",
    "test": "npm run test --workspaces"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "typescript": "^5.5.0"
  }
}
```

#### 1.2 Restructure Backend

```bash
# Move backend to its own workspace
mkdir -p backend
# Already exists, just needs package.json update
```

**backend/package.json:**
```json
{
  "name": "@multiversal/backend",
  "version": "2.0.0",
  "private": true,
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "node-fetch": "^2.7.0",
    "cheerio": "^1.0.0-rc.12",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Step 2: Create Shared Package

#### 2.1 Set Up Shared Types & API Client

```bash
mkdir -p shared/src/{types,api,utils}
```

**shared/package.json:**
```json
{
  "name": "@multiversal/shared",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "tsup": "^8.2.0",
    "typescript": "^5.5.0"
  }
}
```

**shared/src/types/index.ts:**
```typescript
export interface Bookmark {
  id: number;
  url: string;
  title: string;
  description: string | null;
  favicon: string | null;
  added_by: string;
  created_at: string;
  tags?: string[];
}

export interface Tag {
  id: number;
  name: string;
  color: string | null;
  count?: number;
}

export interface Collection {
  id: number;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  bookmark_count?: number;
}

export interface CreateBookmarkInput {
  url: string;
  tags?: string[];
  added_by?: string;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  created_by?: string;
}

// Graph types for Cytoscape
export interface GraphNode {
  data: {
    id: string;
    title: string;
    url: string;
    tags: string[];
    connections: number;
    type: 'bookmark';
  };
}

export interface GraphEdge {
  data: {
    id: string;
    source: string;
    target: string;
    weight: number;
    type: 'tag' | 'collection' | 'domain' | 'temporal';
  };
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```

**shared/src/api/client.ts:**
```typescript
import type {
  Bookmark,
  Tag,
  Collection,
  CreateBookmarkInput,
  CreateCollectionInput
} from '../types';

export class BookmarksAPI {
  constructor(private baseURL: string = 'http://localhost:3000') {}

  // Bookmarks
  async getBookmarks(): Promise<Bookmark[]> {
    const res = await fetch(`${this.baseURL}/api/bookmarks`);
    if (!res.ok) throw new Error('Failed to fetch bookmarks');
    return res.json();
  }

  async getBookmark(id: number): Promise<Bookmark> {
    const res = await fetch(`${this.baseURL}/api/bookmarks/${id}`);
    if (!res.ok) throw new Error('Failed to fetch bookmark');
    return res.json();
  }

  async createBookmark(data: CreateBookmarkInput): Promise<Bookmark> {
    const res = await fetch(`${this.baseURL}/api/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create bookmark');
    return res.json();
  }

  async deleteBookmark(id: number): Promise<void> {
    const res = await fetch(`${this.baseURL}/api/bookmarks/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete bookmark');
  }

  async searchBookmarks(query: string): Promise<Bookmark[]> {
    const res = await fetch(`${this.baseURL}/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search bookmarks');
    return res.json();
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    const res = await fetch(`${this.baseURL}/api/tags`);
    if (!res.ok) throw new Error('Failed to fetch tags');
    return res.json();
  }

  async addTagToBookmark(bookmarkId: number, tag: string): Promise<Bookmark> {
    const res = await fetch(`${this.baseURL}/api/bookmarks/${bookmarkId}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag })
    });
    if (!res.ok) throw new Error('Failed to add tag');
    return res.json();
  }

  // Collections
  async getCollections(): Promise<Collection[]> {
    const res = await fetch(`${this.baseURL}/api/collections`);
    if (!res.ok) throw new Error('Failed to fetch collections');
    return res.json();
  }

  async getCollection(id: number): Promise<Collection> {
    const res = await fetch(`${this.baseURL}/api/collections/${id}`);
    if (!res.ok) throw new Error('Failed to fetch collection');
    return res.json();
  }

  async getCollectionBookmarks(id: number): Promise<Bookmark[]> {
    const res = await fetch(`${this.baseURL}/api/collections/${id}/bookmarks`);
    if (!res.ok) throw new Error('Failed to fetch collection bookmarks');
    return res.json();
  }

  async createCollection(data: CreateCollectionInput): Promise<Collection> {
    const res = await fetch(`${this.baseURL}/api/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create collection');
    return res.json();
  }

  async addBookmarkToCollection(collectionId: number, bookmarkId: number): Promise<Bookmark[]> {
    const res = await fetch(`${this.baseURL}/api/collections/${collectionId}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmark_id: bookmarkId })
    });
    if (!res.ok) throw new Error('Failed to add bookmark to collection');
    return res.json();
  }
}
```

**shared/src/utils/graph.ts:**
```typescript
import type { Bookmark, GraphData, GraphNode, GraphEdge } from '../types';

/**
 * Transform bookmarks into Cytoscape graph data
 * Creates nodes for each bookmark and edges based on relationships
 */
export function buildGraphFromBookmarks(bookmarks: Bookmark[]): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edgeMap = new Map<string, GraphEdge>();

  // Create nodes
  bookmarks.forEach(bookmark => {
    nodes.push({
      data: {
        id: `bookmark-${bookmark.id}`,
        title: bookmark.title,
        url: bookmark.url,
        tags: bookmark.tags || [],
        connections: 0,
        type: 'bookmark'
      }
    });
  });

  // Create edges based on shared tags
  for (let i = 0; i < bookmarks.length; i++) {
    for (let j = i + 1; j < bookmarks.length; j++) {
      const b1 = bookmarks[i];
      const b2 = bookmarks[j];

      const sharedTags = (b1.tags || []).filter(tag =>
        (b2.tags || []).includes(tag)
      );

      if (sharedTags.length > 0) {
        const edgeId = `${b1.id}-${b2.id}`;
        const edge: GraphEdge = {
          data: {
            id: edgeId,
            source: `bookmark-${b1.id}`,
            target: `bookmark-${b2.id}`,
            weight: sharedTags.length,
            type: 'tag'
          }
        };
        edgeMap.set(edgeId, edge);
      }

      // Edge based on same domain
      const domain1 = new URL(b1.url).hostname;
      const domain2 = new URL(b2.url).hostname;
      if (domain1 === domain2) {
        const edgeId = `${b1.id}-${b2.id}-domain`;
        edgeMap.set(edgeId, {
          data: {
            id: edgeId,
            source: `bookmark-${b1.id}`,
            target: `bookmark-${b2.id}`,
            weight: 0.5,
            type: 'domain'
          }
        });
      }
    }
  }

  // Update connection counts
  edgeMap.forEach(edge => {
    edges.push(edge);
    const sourceNode = nodes.find(n => n.data.id === edge.data.source);
    const targetNode = nodes.find(n => n.data.id === edge.data.target);
    if (sourceNode) sourceNode.data.connections++;
    if (targetNode) targetNode.data.connections++;
  });

  return { nodes, edges };
}

/**
 * Calculate graph statistics
 */
export function getGraphStats(data: GraphData) {
  const avgConnections = data.nodes.reduce((sum, n) => sum + n.data.connections, 0) / data.nodes.length;
  const maxConnections = Math.max(...data.nodes.map(n => n.data.connections));
  const minConnections = Math.min(...data.nodes.map(n => n.data.connections));

  return {
    nodeCount: data.nodes.length,
    edgeCount: data.edges.length,
    avgConnections: avgConnections.toFixed(2),
    maxConnections,
    minConnections
  };
}
```

**shared/src/index.ts:**
```typescript
// Types
export * from './types';

// API Client
export { BookmarksAPI } from './api/client';

// Utils
export { buildGraphFromBookmarks, getGraphStats } from './utils/graph';
```

**shared/tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**shared/tsup.config.ts:**
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
```

### Step 3: Create React Web App

#### 3.1 Initialize Vite + React

```bash
npm create vite@latest web -- --template react-ts
cd web
npm install
```

#### 3.2 Install Dependencies

```bash
cd web
npm install cytoscape cytoscape-cose-bilkent
npm install @tanstack/react-query
npm install react-router-dom
npm install @multiversal/shared@workspace:*
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 3.3 Component Mapping

**Vanilla JS → React Component Mapping:**

| Vanilla JS Function | React Component | File |
|---------------------|-----------------|------|
| `renderBookmarks()` | `<BookmarkList>` | `BookmarkList.tsx` |
| Tag filter | `<Sidebar>` | `Sidebar.tsx` |
| `showAddModal()` | `<AddBookmarkModal>` | `AddBookmarkModal.tsx` |
| `searchBookmarks()` | `useBookmarkSearch()` hook | `hooks/useBookmarks.ts` |
| NEW | `<GraphView>` | `GraphView.tsx` |

#### 3.4 Core Components Structure

```
web/src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── bookmarks/
│   │   ├── BookmarkCard.tsx
│   │   ├── BookmarkList.tsx
│   │   └── BookmarkGrid.tsx
│   ├── graph/
│   │   ├── GraphView.tsx          # ⭐ Cytoscape.js integration
│   │   ├── GraphControls.tsx
│   │   ├── GraphLegend.tsx
│   │   └── GraphStats.tsx
│   ├── modals/
│   │   ├── AddBookmarkModal.tsx
│   │   └── CreateCollectionModal.tsx
│   └── ui/
│       ├── SearchBox.tsx
│       ├── TagBadge.tsx
│       └── ViewToggle.tsx
├── hooks/
│   ├── useBookmarks.ts
│   ├── useTags.ts
│   ├── useCollections.ts
│   └── useGraph.ts
├── App.tsx
├── main.tsx
└── index.css
```

### Step 4: Build the Graph View (Killer Feature!)

**web/src/components/graph/GraphView.tsx:**

See implementation in next section...

### Step 5: Migration Checklist

#### Features to Migrate

- [ ] **Bookmarks**
  - [ ] Display all bookmarks
  - [ ] Add new bookmark (with metadata extraction)
  - [ ] Delete bookmark
  - [ ] Search bookmarks
  - [ ] Filter by tag
  - [ ] View bookmark details

- [ ] **Tags**
  - [ ] Display all tags
  - [ ] Tag cloud/list
  - [ ] Filter bookmarks by tag
  - [ ] Tag auto-suggestions

- [ ] **Collections**
  - [ ] List collections
  - [ ] Create collection
  - [ ] View collection bookmarks
  - [ ] Add bookmark to collection

- [ ] **UI/UX**
  - [ ] Responsive layout
  - [ ] Loading states
  - [ ] Error handling
  - [ ] Empty states
  - [ ] Animations/transitions
  - [ ] Tailwind styling

- [ ] **NEW: Graph View**
  - [ ] Cytoscape.js integration
  - [ ] Force-directed layout
  - [ ] Node sizing by connections
  - [ ] Edge coloring by relationship type
  - [ ] Click to view bookmark
  - [ ] Zoom/pan controls
  - [ ] Search highlighting
  - [ ] Tag filtering
  - [ ] Export graph as image

#### Testing Checklist

- [ ] All API calls work
- [ ] Graph renders correctly
- [ ] Graph updates on data changes
- [ ] Performance with 100+ bookmarks
- [ ] Performance with 500+ bookmarks
- [ ] Mobile responsive
- [ ] Keyboard navigation
- [ ] Accessibility (a11y)

### Step 6: Deployment Updates

**Update docker-compose.yml:**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - "5173:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:3000
```

## 🎯 Quick Start (After Migration)

```bash
# 1. Install all dependencies
npm install

# 2. Build shared package
npm run build --workspace=shared

# 3. Start development
npm run dev:all

# Web app will be at http://localhost:5173
# Backend API at http://localhost:3000
```

## 📊 Success Metrics

- ✅ All existing features working in React
- ✅ Graph view functional with 100+ bookmarks
- ✅ Performance: FCP < 1.5s
- ✅ Bundle size < 500KB (gzipped)
- ✅ Zero regressions
- ✅ Improved UX with graph visualization

## 🚧 Rollback Plan

If migration fails:
1. Keep `/frontend` folder intact (v1)
2. Serve v1 from `/frontend-legacy` route
3. Feature flag to switch between v1/v2
4. Monitor user feedback

## 📚 Resources

- [Cytoscape.js Docs](https://js.cytoscape.org/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

## 🎉 What's Next?

After web migration:
1. Build CLI with Ink
2. Wrap with Tauri for desktop
3. PWA for mobile
4. Celebrate! 🎊
