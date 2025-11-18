# Implementation Examples

## 🎨 1. Cytoscape.js Graph View Component

### GraphView.tsx (React + Cytoscape.js)

```typescript
// web/src/components/graph/GraphView.tsx
import { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, ElementDefinition } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { buildGraphFromBookmarks } from '@multiversal/shared';
import type { Bookmark } from '@multiversal/shared';

// Register layout
cytoscape.use(coseBilkent);

interface GraphViewProps {
  bookmarks: Bookmark[];
  onNodeClick?: (bookmark: Bookmark) => void;
  selectedTags?: string[];
}

export function GraphView({ bookmarks, onNodeClick, selectedTags = [] }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [stats, setStats] = useState({ nodes: 0, edges: 0, avgConnections: 0 });

  useEffect(() => {
    if (!containerRef.current || bookmarks.length === 0) return;

    // Build graph data
    const graphData = buildGraphFromBookmarks(bookmarks);

    // Create Cytoscape instance
    const cy = cytoscape({
      container: containerRef.current,

      elements: [...graphData.nodes, ...graphData.edges],

      style: [
        // Node styles
        {
          selector: 'node',
          style: {
            'background-color': '#4F46E5',
            'label': 'data(title)',
            'width': (ele) => {
              const connections = ele.data('connections') || 1;
              return Math.min(40 + connections * 5, 80);
            },
            'height': (ele) => {
              const connections = ele.data('connections') || 1;
              return Math.min(40 + connections * 5, 80);
            },
            'font-size': '10px',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 5,
            'color': '#1F2937',
            'text-outline-color': '#FFFFFF',
            'text-outline-width': 2,
            'text-max-width': '100px',
            'text-wrap': 'ellipsis',
            'overlay-opacity': 0
          }
        },

        // Edge styles
        {
          selector: 'edge',
          style: {
            'width': (ele) => {
              const weight = ele.data('weight') || 1;
              return Math.max(1, weight);
            },
            'line-color': '#94A3B8',
            'curve-style': 'bezier',
            'opacity': 0.6
          }
        },

        // Tag edges (shared tags)
        {
          selector: 'edge[type="tag"]',
          style: {
            'line-color': '#3B82F6',
            'target-arrow-shape': 'none'
          }
        },

        // Domain edges (same website)
        {
          selector: 'edge[type="domain"]',
          style: {
            'line-color': '#10B981',
            'line-style': 'dashed'
          }
        },

        // Selected node
        {
          selector: 'node:selected',
          style: {
            'background-color': '#EC4899',
            'border-width': 3,
            'border-color': '#BE185D',
            'z-index': 999
          }
        },

        // Hovered node
        {
          selector: 'node:active',
          style: {
            'overlay-opacity': 0.2,
            'overlay-color': '#4F46E5'
          }
        },

        // Highlighted (filtered by tag)
        {
          selector: 'node.highlighted',
          style: {
            'background-color': '#F59E0B',
            'border-width': 2,
            'border-color': '#D97706'
          }
        },

        // Dimmed (not matching filter)
        {
          selector: 'node.dimmed',
          style: {
            'opacity': 0.3
          }
        },

        {
          selector: 'edge.dimmed',
          style: {
            'opacity': 0.1
          }
        }
      ],

      layout: {
        name: 'cose-bilkent',
        animate: true,
        animationDuration: 1000,
        nodeDimensionsIncludeLabels: true,
        randomize: false,
        idealEdgeLength: 100,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        numIter: 2500,
        tile: true,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10
      },

      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.2
    });

    // Event handlers
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const bookmarkId = parseInt(node.id().replace('bookmark-', ''));
      const bookmark = bookmarks.find(b => b.id === bookmarkId);

      if (bookmark && onNodeClick) {
        onNodeClick(bookmark);
      }
    });

    // Hover effects
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      node.style('cursor', 'pointer');

      // Highlight connected nodes
      const connectedEdges = node.connectedEdges();
      const connectedNodes = connectedEdges.connectedNodes();

      cy.elements().addClass('dimmed');
      node.removeClass('dimmed');
      connectedNodes.removeClass('dimmed');
      connectedEdges.removeClass('dimmed');
    });

    cy.on('mouseout', 'node', () => {
      cy.elements().removeClass('dimmed');
    });

    // Update stats
    setStats({
      nodes: graphData.nodes.length,
      edges: graphData.edges.length,
      avgConnections: graphData.nodes.reduce((sum, n) => sum + n.data.connections, 0) / graphData.nodes.length
    });

    cyRef.current = cy;

    // Cleanup
    return () => {
      cy.destroy();
    };
  }, [bookmarks]);

  // Handle tag filtering
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    if (selectedTags.length === 0) {
      // Reset all highlighting
      cy.nodes().removeClass('highlighted dimmed');
      return;
    }

    // Highlight nodes with selected tags
    cy.nodes().forEach(node => {
      const nodeTags = node.data('tags') || [];
      const hasSelectedTag = selectedTags.some(tag => nodeTags.includes(tag));

      if (hasSelectedTag) {
        node.addClass('highlighted');
        node.removeClass('dimmed');
      } else {
        node.removeClass('highlighted');
        node.addClass('dimmed');
      }
    });
  }, [selectedTags]);

  return (
    <div className="relative w-full h-full">
      {/* Graph Container */}
      <div
        ref={containerRef}
        className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg"
      />

      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3 text-sm">
        <div className="font-semibold text-gray-900 mb-1">Graph Stats</div>
        <div className="space-y-1 text-gray-600">
          <div>{stats.nodes} nodes</div>
          <div>{stats.edges} connections</div>
          <div>{stats.avgConnections.toFixed(1)} avg connections</div>
        </div>
      </div>

      {/* Controls Overlay */}
      <GraphControls cy={cyRef.current} />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3 text-xs">
        <div className="font-semibold text-gray-900 mb-2">Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span className="text-gray-600">Shared tags</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500 border-dashed border-t"></div>
            <span className="text-gray-600">Same domain</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600">Filtered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### GraphControls.tsx

```typescript
// web/src/components/graph/GraphControls.tsx
import { Core } from 'cytoscape';
import { ZoomIn, ZoomOut, Maximize, Download } from 'lucide-react';

interface GraphControlsProps {
  cy: Core | null;
}

export function GraphControls({ cy }: GraphControlsProps) {
  const handleZoomIn = () => cy?.zoom({ level: cy.zoom() * 1.2 });
  const handleZoomOut = () => cy?.zoom({ level: cy.zoom() * 0.8 });
  const handleFit = () => cy?.fit(undefined, 50);

  const handleExport = () => {
    if (!cy) return;

    const png = cy.png({
      output: 'blob',
      bg: '#F8FAFC',
      full: true,
      scale: 2
    });

    const url = URL.createObjectURL(png);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks-graph-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-2 flex gap-1">
      <button
        onClick={handleZoomIn}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Zoom In"
      >
        <ZoomIn size={18} />
      </button>
      <button
        onClick={handleZoomOut}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Zoom Out"
      >
        <ZoomOut size={18} />
      </button>
      <button
        onClick={handleFit}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Fit to Screen"
      >
        <Maximize size={18} />
      </button>
      <div className="w-px bg-gray-300 mx-1" />
      <button
        onClick={handleExport}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Export as Image"
      >
        <Download size={18} />
      </button>
    </div>
  );
}
```

## 🖥️ 2. Ink CLI Component

### CLI Entry Point

```typescript
// cli/src/index.tsx
#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { program } from 'commander';
import App from './App.js';

program
  .name('multiversal-bookmarks')
  .description('CLI for Multiversal Bookmarks')
  .version('2.0.0');

program
  .command('list')
  .description('List all bookmarks')
  .option('-t, --tag <tag>', 'Filter by tag')
  .action((options) => {
    render(<App command="list" options={options} />);
  });

program
  .command('add <url>')
  .description('Add a new bookmark')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .option('-u, --user <user>', 'Your name')
  .action((url, options) => {
    render(<App command="add" url={url} options={options} />);
  });

program
  .command('search <query>')
  .description('Search bookmarks')
  .action((query) => {
    render(<App command="search" query={query} />);
  });

program
  .command('graph')
  .description('View bookmarks as ASCII graph')
  .option('-t, --tag <tag>', 'Filter by tag')
  .action((options) => {
    render(<App command="graph" options={options} />);
  });

program.parse();
```

### CLI App Component

```typescript
// cli/src/App.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { BookmarksAPI, type Bookmark } from '@multiversal/shared';
import { BookmarkList } from './components/BookmarkList.js';
import { GraphASCII } from './components/GraphASCII.js';

interface AppProps {
  command: 'list' | 'add' | 'search' | 'graph';
  url?: string;
  query?: string;
  options?: any;
}

export default function App({ command, url, query, options }: AppProps) {
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [error, setError] = useState<string | null>(null);

  const api = new BookmarksAPI(process.env.API_URL || 'http://localhost:3000');

  useEffect(() => {
    async function execute() {
      try {
        switch (command) {
          case 'list':
            const allBookmarks = await api.getBookmarks();
            const filtered = options?.tag
              ? allBookmarks.filter(b => b.tags?.includes(options.tag))
              : allBookmarks;
            setBookmarks(filtered);
            break;

          case 'search':
            if (query) {
              const results = await api.searchBookmarks(query);
              setBookmarks(results);
            }
            break;

          case 'add':
            if (url) {
              const tags = options?.tags?.split(',').map((t: string) => t.trim()) || [];
              await api.createBookmark({
                url,
                tags,
                added_by: options?.user || 'cli-user'
              });
              setBookmarks([]);
            }
            break;

          case 'graph':
            const graphBookmarks = await api.getBookmarks();
            const graphFiltered = options?.tag
              ? graphBookmarks.filter(b => b.tags?.includes(options.tag))
              : graphBookmarks;
            setBookmarks(graphFiltered);
            break;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    execute();
  }, []);

  if (loading) {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" />
          {' '}Loading...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (command === 'add') {
    return (
      <Box>
        <Text color="green">✓ Bookmark added successfully!</Text>
      </Box>
    );
  }

  if (command === 'graph') {
    return <GraphASCII bookmarks={bookmarks} />;
  }

  return <BookmarkList bookmarks={bookmarks} />;
}
```

### ASCII Graph Component

```typescript
// cli/src/components/GraphASCII.tsx
import React from 'react';
import { Box, Text } from 'ink';
import type { Bookmark } from '@multiversal/shared';

interface GraphASCIIProps {
  bookmarks: Bookmark[];
}

export function GraphASCII({ bookmarks }: GraphASCIIProps) {
  // Simple tree-based ASCII visualization
  // Group by tags for hierarchical display
  const tagGroups = new Map<string, Bookmark[]>();

  bookmarks.forEach(bookmark => {
    bookmark.tags?.forEach(tag => {
      if (!tagGroups.has(tag)) {
        tagGroups.set(tag, []);
      }
      tagGroups.get(tag)?.push(bookmark);
    });
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        📊 Bookmark Graph ({bookmarks.length} nodes)
      </Text>
      <Text color="gray">─────────────────────────────────────</Text>

      {Array.from(tagGroups.entries()).map(([tag, items], i) => (
        <Box key={tag} flexDirection="column" marginTop={1}>
          <Text color="yellow">
            {i === 0 ? '┌' : '├'}── #{tag} ({items.length})
          </Text>
          {items.slice(0, 3).map((bookmark, j) => (
            <Text key={bookmark.id} color="gray">
              {'│   '}{j === items.length - 1 ? '└' : '├'}─ {bookmark.title}
            </Text>
          ))}
          {items.length > 3 && (
            <Text color="gray">│   └─ ... {items.length - 3} more</Text>
          )}
        </Box>
      ))}

      <Text color="gray" marginTop={1}>
        └─────────────────────────────────────
      </Text>
    </Box>
  );
}
```

## 🖥️ 3. Tauri Desktop Setup

### Initialize Tauri

```bash
cd desktop
npm install @tauri-apps/cli@next @tauri-apps/api@next
npm install --save-dev @tauri-apps/cli
npx tauri init
```

### Tauri Configuration

```json
// desktop/src-tauri/tauri.conf.json
{
  "build": {
    "beforeDevCommand": "npm run dev --workspace=web",
    "beforeBuildCommand": "npm run build --workspace=web",
    "devPath": "http://localhost:5173",
    "distDir": "../web/dist"
  },
  "package": {
    "productName": "Multiversal Bookmarks",
    "version": "2.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "open": true
      },
      "notification": {
        "all": true
      }
    },
    "bundle": {
      "active": true,
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "com.themultiverse.bookmarks",
      "targets": "all"
    },
    "security": {
      "csp": null
    },
    "windows": [
      {
        "fullscreen": false,
        "resizable": true,
        "title": "Multiversal Bookmarks",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600
      }
    ],
    "systemTray": {
      "iconPath": "icons/icon.png",
      "menuOnLeftClick": false
    }
  }
}
```

### Cargo.toml

```toml
# desktop/src-tauri/Cargo.toml
[package]
name = "multiversal-bookmarks"
version = "2.0.0"
description = "Collaborative bookmarking for themultiverse.school"
authors = ["Multiverse School"]
license = "MIT"
repository = ""
edition = "2021"

[build-dependencies]
tauri-build = { version = "2.0.0-beta", features = [] }

[dependencies]
tauri = { version = "2.0.0-beta", features = ["shell-open", "notification-all"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]
```

### Main Rust File

```rust
// desktop/src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;

fn main() {
    // System tray menu
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "show" => {
                        let window = app.get_window("main").unwrap();
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## 🚀 Build Commands

```json
// desktop/package.json
{
  "name": "@multiversal/desktop",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "tauri": "tauri",
    "dev": "tauri dev",
    "build": "tauri build",
    "build:mac": "tauri build --target aarch64-apple-darwin",
    "build:windows": "tauri build --target x86_64-pc-windows-msvc",
    "build:linux": "tauri build --target x86_64-unknown-linux-gnu"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0-beta"
  }
}
```

---

## 🎯 Summary

These examples show:

1. **Web**: Full Cytoscape.js integration with React
2. **CLI**: Ink-based terminal UI with ASCII graph visualization
3. **Desktop**: Tauri wrapper around React web app

All three platforms share:
- Same API client (`@multiversal/shared`)
- Same data types
- Same backend (Express.js)
- Same mental model (bookmarks as graph nodes)

The **neural network aesthetic** is achieved through:
- Force-directed layouts (organic clustering)
- Node sizing by connections
- Bezier curves for edges
- Color-coded relationships
- Interactive highlighting

Ready to start building? 🚀
