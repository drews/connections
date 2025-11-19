# Multiversal Bookmarks - Python/FastAPI Implementation

This is a Python rewrite of the Multiversal Bookmarks application using FastAPI.

## Quick Start

### Local Development

1. Install dependencies:
```bash
cd python
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

3. Open your browser to:
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:3000/docs
   - OpenAPI Spec: http://localhost:3000/openapi.json

### Docker

From the project root:

```bash
docker-compose -f docker-compose.python.yml up --build
```

## Architecture

- **FastAPI**: Modern Python web framework with automatic OpenAPI documentation
- **SQLite**: Simple, portable database
- **Pydantic**: Data validation using Python type hints
- **BeautifulSoup**: HTML parsing for metadata extraction

## API Documentation

The API follows the OpenAPI 3.0 specification in `../openapi.yaml`.

Visit http://localhost:3000/docs for interactive API documentation.

## Project Structure

```
python/
├── main.py          # FastAPI application
├── database.py      # SQLite database operations
├── metadata.py      # URL metadata extraction
├── requirements.txt # Python dependencies
├── Dockerfile       # Docker configuration
└── README.md        # This file
```

## Development

The application automatically reloads on code changes when running with:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 3000
```
