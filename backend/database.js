const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor(dbPath = path.join(__dirname, '..', 'bookmarks.db')) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('📚 Connected to bookmarks database');
        this.initialize();
      }
    });
  }

  initialize() {
    this.db.serialize(() => {
      // Bookmarks table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS bookmarks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          url TEXT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          description TEXT,
          favicon TEXT,
          image TEXT,
          type TEXT DEFAULT 'website',
          added_by TEXT DEFAULT 'anonymous',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tags table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          color TEXT DEFAULT '#3b82f6'
        )
      `);

      // Bookmark-Tags junction
      this.db.run(`
        CREATE TABLE IF NOT EXISTS bookmark_tags (
          bookmark_id INTEGER,
          tag_id INTEGER,
          FOREIGN KEY(bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
          FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE,
          PRIMARY KEY (bookmark_id, tag_id)
        )
      `);

      // Collections table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS collections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          created_by TEXT DEFAULT 'anonymous',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Collection-Bookmarks junction
      this.db.run(`
        CREATE TABLE IF NOT EXISTS collection_bookmarks (
          collection_id INTEGER,
          bookmark_id INTEGER,
          position INTEGER DEFAULT 0,
          FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE,
          FOREIGN KEY(bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
          PRIMARY KEY (collection_id, bookmark_id)
        )
      `);

      console.log('✓ Database tables ready');
    });
  }

  // Bookmarks
  async getAllBookmarks() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT b.*, GROUP_CONCAT(t.name) as tags
         FROM bookmarks b
         LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
         LEFT JOIN tags t ON bt.tag_id = t.id
         GROUP BY b.id
         ORDER BY b.created_at DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
          })));
        }
      );
    });
  }

  async getBookmark(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT b.*, GROUP_CONCAT(t.name) as tags
         FROM bookmarks b
         LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
         LEFT JOIN tags t ON bt.tag_id = t.id
         WHERE b.id = ?
         GROUP BY b.id`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? { ...row, tags: row.tags ? row.tags.split(',') : [] } : null);
        }
      );
    });
  }

  async createBookmark(data) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO bookmarks (url, title, description, favicon, image, type, added_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [data.url, data.title, data.description, data.favicon, data.image, data.type, data.added_by || 'anonymous'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async deleteBookmark(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM bookmarks WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async search(query) {
    return new Promise((resolve, reject) => {
      const searchTerm = `%${query}%`;
      this.db.all(
        `SELECT DISTINCT b.*, GROUP_CONCAT(t.name) as tags
         FROM bookmarks b
         LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
         LEFT JOIN tags t ON bt.tag_id = t.id
         WHERE b.title LIKE ? OR b.description LIKE ? OR b.url LIKE ? OR t.name LIKE ?
         GROUP BY b.id
         ORDER BY b.created_at DESC`,
        [searchTerm, searchTerm, searchTerm, searchTerm],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
          })));
        }
      );
    });
  }

  // Tags
  async getOrCreateTag(name) {
    return new Promise((resolve, reject) => {
      // Try to get existing tag
      this.db.get('SELECT * FROM tags WHERE name = ?', [name], (err, row) => {
        if (err) return reject(err);
        if (row) return resolve(row);

        // Create new tag
        this.db.run(
          'INSERT INTO tags (name) VALUES (?)',
          [name],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, name });
          }
        );
      });
    });
  }

  async addTagToBookmark(bookmarkId, tagName) {
    const tag = await this.getOrCreateTag(tagName);
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)',
        [bookmarkId, tag.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getAllTags() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT t.*, COUNT(bt.bookmark_id) as count
         FROM tags t
         LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
         GROUP BY t.id
         ORDER BY count DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Collections
  async getAllCollections() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT c.*, COUNT(cb.bookmark_id) as bookmark_count
         FROM collections c
         LEFT JOIN collection_bookmarks cb ON c.id = cb.collection_id
         GROUP BY c.id
         ORDER BY c.created_at DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async getCollection(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM collections WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async createCollection(data) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO collections (name, description, created_by) VALUES (?, ?, ?)',
        [data.name, data.description, data.created_by || 'anonymous'],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...data });
        }
      );
    });
  }

  async addToCollection(collectionId, bookmarkId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR IGNORE INTO collection_bookmarks (collection_id, bookmark_id) VALUES (?, ?)',
        [collectionId, bookmarkId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getCollectionBookmarks(collectionId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT b.*, GROUP_CONCAT(t.name) as tags
         FROM bookmarks b
         JOIN collection_bookmarks cb ON b.id = cb.bookmark_id
         LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
         LEFT JOIN tags t ON bt.tag_id = t.id
         WHERE cb.collection_id = ?
         GROUP BY b.id
         ORDER BY cb.position, b.created_at DESC`,
        [collectionId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
          })));
        }
      );
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = Database;
