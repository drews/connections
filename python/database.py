import sqlite3
from contextlib import contextmanager
from typing import List, Dict, Optional
from datetime import datetime


class Database:
    def __init__(self, db_path: str = "bookmarks.db"):
        self.db_path = db_path
        self.initialize()

    @contextmanager
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def initialize(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Bookmarks table
            cursor.execute("""
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
            """)

            # Tags table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tags (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    color TEXT DEFAULT '#3b82f6'
                )
            """)

            # Bookmark-Tags junction
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS bookmark_tags (
                    bookmark_id INTEGER,
                    tag_id INTEGER,
                    FOREIGN KEY(bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
                    FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE,
                    PRIMARY KEY (bookmark_id, tag_id)
                )
            """)

            # Collections table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS collections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    created_by TEXT DEFAULT 'anonymous',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Collection-Bookmarks junction
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS collection_bookmarks (
                    collection_id INTEGER,
                    bookmark_id INTEGER,
                    position INTEGER DEFAULT 0,
                    FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE,
                    FOREIGN KEY(bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
                    PRIMARY KEY (collection_id, bookmark_id)
                )
            """)

            print("✓ Database tables ready")

    def _row_to_dict(self, row) -> Dict:
        return dict(row) if row else None

    def _rows_to_list(self, rows) -> List[Dict]:
        return [dict(row) for row in rows]

    # Bookmarks
    def get_all_bookmarks(self) -> List[Dict]:
        with self.get_connection() as conn:
            cursor = conn.execute("""
                SELECT b.*, GROUP_CONCAT(t.name) as tags
                FROM bookmarks b
                LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
                LEFT JOIN tags t ON bt.tag_id = t.id
                GROUP BY b.id
                ORDER BY b.created_at DESC
            """)
            rows = cursor.fetchall()
            return [
                {**dict(row), 'tags': row['tags'].split(',') if row['tags'] else []}
                for row in rows
            ]

    def get_bookmark(self, bookmark_id: int) -> Optional[Dict]:
        with self.get_connection() as conn:
            cursor = conn.execute("""
                SELECT b.*, GROUP_CONCAT(t.name) as tags
                FROM bookmarks b
                LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
                LEFT JOIN tags t ON bt.tag_id = t.id
                WHERE b.id = ?
                GROUP BY b.id
            """, (bookmark_id,))
            row = cursor.fetchone()
            if row:
                return {**dict(row), 'tags': row['tags'].split(',') if row['tags'] else []}
            return None

    def create_bookmark(self, data: Dict) -> int:
        with self.get_connection() as conn:
            cursor = conn.execute("""
                INSERT INTO bookmarks (url, title, description, favicon, image, type, added_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                data['url'],
                data['title'],
                data.get('description', ''),
                data.get('favicon', ''),
                data.get('image', ''),
                data.get('type', 'website'),
                data.get('added_by', 'anonymous')
            ))
            return cursor.lastrowid

    def delete_bookmark(self, bookmark_id: int):
        with self.get_connection() as conn:
            conn.execute("DELETE FROM bookmarks WHERE id = ?", (bookmark_id,))

    def search(self, query: str) -> List[Dict]:
        search_term = f"%{query}%"
        with self.get_connection() as conn:
            cursor = conn.execute("""
                SELECT DISTINCT b.*, GROUP_CONCAT(t.name) as tags
                FROM bookmarks b
                LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
                LEFT JOIN tags t ON bt.tag_id = t.id
                WHERE b.title LIKE ? OR b.description LIKE ? OR b.url LIKE ? OR t.name LIKE ?
                GROUP BY b.id
                ORDER BY b.created_at DESC
            """, (search_term, search_term, search_term, search_term))
            rows = cursor.fetchall()
            return [
                {**dict(row), 'tags': row['tags'].split(',') if row['tags'] else []}
                for row in rows
            ]

    # Tags
    def get_or_create_tag(self, name: str) -> Dict:
        with self.get_connection() as conn:
            cursor = conn.execute("SELECT * FROM tags WHERE name = ?", (name,))
            row = cursor.fetchone()
            if row:
                return dict(row)

            cursor = conn.execute("INSERT INTO tags (name) VALUES (?)", (name,))
            return {'id': cursor.lastrowid, 'name': name, 'color': '#3b82f6'}

    def add_tag_to_bookmark(self, bookmark_id: int, tag_name: str):
        tag = self.get_or_create_tag(tag_name)
        with self.get_connection() as conn:
            conn.execute("""
                INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id)
                VALUES (?, ?)
            """, (bookmark_id, tag['id']))

    def get_all_tags(self) -> List[Dict]:
        with self.get_connection() as conn:
            cursor = conn.execute("""
                SELECT t.*, COUNT(bt.bookmark_id) as count
                FROM tags t
                LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
                GROUP BY t.id
                ORDER BY count DESC
            """)
            return self._rows_to_list(cursor.fetchall())

    # Collections
    def get_all_collections(self) -> List[Dict]:
        with self.get_connection() as conn:
            cursor = conn.execute("""
                SELECT c.*, COUNT(cb.bookmark_id) as bookmark_count
                FROM collections c
                LEFT JOIN collection_bookmarks cb ON c.id = cb.collection_id
                GROUP BY c.id
                ORDER BY c.created_at DESC
            """)
            return self._rows_to_list(cursor.fetchall())

    def get_collection(self, collection_id: int) -> Optional[Dict]:
        with self.get_connection() as conn:
            cursor = conn.execute("SELECT * FROM collections WHERE id = ?", (collection_id,))
            row = cursor.fetchone()
            return self._row_to_dict(row)

    def create_collection(self, data: Dict) -> Dict:
        with self.get_connection() as conn:
            cursor = conn.execute("""
                INSERT INTO collections (name, description, created_by)
                VALUES (?, ?, ?)
            """, (data['name'], data.get('description', ''), data.get('created_by', 'anonymous')))
            return {
                'id': cursor.lastrowid,
                'name': data['name'],
                'description': data.get('description', ''),
                'created_by': data.get('created_by', 'anonymous')
            }

    def add_to_collection(self, collection_id: int, bookmark_id: int):
        with self.get_connection() as conn:
            conn.execute("""
                INSERT OR IGNORE INTO collection_bookmarks (collection_id, bookmark_id)
                VALUES (?, ?)
            """, (collection_id, bookmark_id))

    def get_collection_bookmarks(self, collection_id: int) -> List[Dict]:
        with self.get_connection() as conn:
            cursor = conn.execute("""
                SELECT b.*, GROUP_CONCAT(t.name) as tags
                FROM bookmarks b
                JOIN collection_bookmarks cb ON b.id = cb.bookmark_id
                LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
                LEFT JOIN tags t ON bt.tag_id = t.id
                WHERE cb.collection_id = ?
                GROUP BY b.id
                ORDER BY cb.position, b.created_at DESC
            """, (collection_id,))
            rows = cursor.fetchall()
            return [
                {**dict(row), 'tags': row['tags'].split(',') if row['tags'] else []}
                for row in rows
            ]
