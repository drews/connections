const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('./database');
const { extractMetadata } = require('./metadata');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const db = new Database();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ========== Bookmarks API ==========

// Get all bookmarks
app.get('/api/bookmarks', async (req, res) => {
  try {
    const bookmarks = await db.getAllBookmarks();
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single bookmark
app.get('/api/bookmarks/:id', async (req, res) => {
  try {
    const bookmark = await db.getBookmark(req.params.id);
    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create bookmark
app.post('/api/bookmarks', async (req, res) => {
  try {
    const { url, added_by } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Extract metadata
    console.log(`📥 Fetching metadata for: ${url}`);
    const metadata = await extractMetadata(url);

    // Save bookmark
    const bookmarkId = await db.createBookmark({
      ...metadata,
      added_by: added_by || 'anonymous'
    });

    // Add tags if provided
    if (req.body.tags && Array.isArray(req.body.tags)) {
      for (const tag of req.body.tags) {
        await db.addTagToBookmark(bookmarkId, tag);
      }
    }

    // Get the complete bookmark with tags
    const bookmark = await db.getBookmark(bookmarkId);
    console.log(`✓ Bookmark saved: #${bookmarkId} - ${bookmark.title}`);

    res.status(201).json(bookmark);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete bookmark
app.delete('/api/bookmarks/:id', async (req, res) => {
  try {
    await db.deleteBookmark(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search bookmarks
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const results = await db.search(q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Tags API ==========

// Get all tags
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await db.getAllTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add tag to bookmark
app.post('/api/bookmarks/:id/tags', async (req, res) => {
  try {
    const { tag } = req.body;
    if (!tag) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    await db.addTagToBookmark(req.params.id, tag);
    const bookmark = await db.getBookmark(req.params.id);
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Collections API ==========

// Get all collections
app.get('/api/collections', async (req, res) => {
  try {
    const collections = await db.getAllCollections();
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single collection
app.get('/api/collections/:id', async (req, res) => {
  try {
    const collection = await db.getCollection(req.params.id);
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get collection bookmarks
app.get('/api/collections/:id/bookmarks', async (req, res) => {
  try {
    const bookmarks = await db.getCollectionBookmarks(req.params.id);
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create collection
app.post('/api/collections', async (req, res) => {
  try {
    const { name, description, created_by } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    const collection = await db.createCollection({
      name,
      description: description || '',
      created_by: created_by || 'anonymous'
    });

    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add bookmark to collection
app.post('/api/collections/:id/bookmarks', async (req, res) => {
  try {
    const { bookmark_id } = req.body;
    if (!bookmark_id) {
      return res.status(400).json({ error: 'bookmark_id is required' });
    }

    await db.addToCollection(req.params.id, bookmark_id);
    const bookmarks = await db.getCollectionBookmarks(req.params.id);
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Frontend ==========

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ========== Server Start ==========

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║  📚 Multiversal Bookmarks Server              ║
║                                               ║
║  🌐 http://localhost:${PORT}                     ║
║  🔌 API: http://localhost:${PORT}/api             ║
║                                               ║
║  Building our shared future, one bookmark     ║
║  at a time! 🚀                                ║
╚═══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  db.close();
  process.exit(0);
});
