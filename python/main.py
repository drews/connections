from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from contextlib import asynccontextmanager
import os

from database import Database
from metadata import extract_metadata


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("""
╔═══════════════════════════════════════════════╗
║  📚 Multiversal Bookmarks Server (Python)     ║
║                                               ║
║  🌐 http://localhost:3000                     ║
║  🔌 API: http://localhost:3000/api            ║
║  📖 Docs: http://localhost:3000/docs          ║
║                                               ║
║  Building our shared future, one bookmark     ║
║  at a time! 🚀                                ║
╚═══════════════════════════════════════════════╝
    """)
    yield
    # Shutdown (if needed)

app = FastAPI(
    title="Multiversal Bookmarks API",
    description="Collaborative bookmarking system for themultiverse.school community",
    version="2.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
db = Database()

# Pydantic models
class CreateBookmark(BaseModel):
    url: HttpUrl
    added_by: Optional[str] = "anonymous"
    tags: Optional[List[str]] = []

class AddTag(BaseModel):
    tag: str

class CreateCollection(BaseModel):
    name: str
    description: Optional[str] = ""
    created_by: Optional[str] = "anonymous"

class AddBookmarkToCollection(BaseModel):
    bookmark_id: int


# ========== Bookmarks API ==========

@app.get("/api/bookmarks")
def get_all_bookmarks():
    """Get all bookmarks"""
    return db.get_all_bookmarks()

@app.get("/api/bookmarks/{bookmark_id}")
def get_bookmark(bookmark_id: int):
    """Get a single bookmark"""
    bookmark = db.get_bookmark(bookmark_id)
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return bookmark

@app.post("/api/bookmarks", status_code=201)
def create_bookmark(bookmark: CreateBookmark):
    """Create a new bookmark with metadata extraction"""
    try:
        url = str(bookmark.url)
        print(f"📥 Fetching metadata for: {url}")

        # Extract metadata
        metadata = extract_metadata(url)
        metadata['added_by'] = bookmark.added_by

        # Save bookmark
        bookmark_id = db.create_bookmark(metadata)

        # Add tags if provided
        if bookmark.tags:
            for tag in bookmark.tags:
                db.add_tag_to_bookmark(bookmark_id, tag)

        # Get complete bookmark with tags
        result = db.get_bookmark(bookmark_id)
        print(f"✓ Bookmark saved: #{bookmark_id} - {result['title']}")

        return result

    except Exception as e:
        print(f"Error creating bookmark: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/bookmarks/{bookmark_id}")
def delete_bookmark(bookmark_id: int):
    """Delete a bookmark"""
    db.delete_bookmark(bookmark_id)
    return {"success": True}

@app.get("/api/search")
def search_bookmarks(q: str = Query(..., description="Search query")):
    """Search bookmarks"""
    if not q:
        raise HTTPException(status_code=400, detail='Query parameter "q" is required')
    return db.search(q)


# ========== Tags API ==========

@app.get("/api/tags")
def get_all_tags():
    """Get all tags"""
    return db.get_all_tags()

@app.post("/api/bookmarks/{bookmark_id}/tags")
def add_tag_to_bookmark(bookmark_id: int, tag_data: AddTag):
    """Add a tag to a bookmark"""
    if not tag_data.tag:
        raise HTTPException(status_code=400, detail="Tag name is required")

    db.add_tag_to_bookmark(bookmark_id, tag_data.tag)
    bookmark = db.get_bookmark(bookmark_id)
    return bookmark


# ========== Collections API ==========

@app.get("/api/collections")
def get_all_collections():
    """Get all collections"""
    return db.get_all_collections()

@app.get("/api/collections/{collection_id}")
def get_collection(collection_id: int):
    """Get a single collection"""
    collection = db.get_collection(collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return collection

@app.get("/api/collections/{collection_id}/bookmarks")
def get_collection_bookmarks(collection_id: int):
    """Get bookmarks in a collection"""
    return db.get_collection_bookmarks(collection_id)

@app.post("/api/collections", status_code=201)
def create_collection(collection: CreateCollection):
    """Create a new collection"""
    if not collection.name:
        raise HTTPException(status_code=400, detail="Collection name is required")

    result = db.create_collection(collection.dict())
    return result

@app.post("/api/collections/{collection_id}/bookmarks")
def add_bookmark_to_collection(collection_id: int, data: AddBookmarkToCollection):
    """Add a bookmark to a collection"""
    if not data.bookmark_id:
        raise HTTPException(status_code=400, detail="bookmark_id is required")

    db.add_to_collection(collection_id, data.bookmark_id)
    bookmarks = db.get_collection_bookmarks(collection_id)
    return bookmarks


# ========== Frontend ==========

# Mount static files
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")

@app.get("/")
def read_root():
    """Serve the frontend"""
    frontend_file = os.path.join(frontend_path, "index.html")
    if os.path.exists(frontend_file):
        return FileResponse(frontend_file)
    return {"message": "Multiversal Bookmarks API - Visit /docs for API documentation"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
