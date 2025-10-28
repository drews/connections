# Find Bookmark Command

You are helping the user search through the multiversal bookmarks collection.

## Your Task

1. **Parse the search query** from `/find [query]`

2. **Perform intelligent search**:
   - Search across: titles, descriptions, tags, URLs
   - Use fuzzy matching for typos
   - Rank by relevance (title matches > description matches > tag matches)
   - Consider bookmark popularity (save count)

3. **Display results beautifully**:
   ```
   Found 5 bookmarks matching "react component"

   1. ⚛️ Thinking in React – React Official Docs
      https://react.dev/learn/thinking-in-react
      Tags: react, tutorial, documentation
      Saved by 12 people

   2. 📦 React Component Patterns
      https://kentcdodds.com/blog/react-component-patterns
      Tags: react, patterns, advanced
      Saved by 8 people

   [Showing top 5 results - use /find "query" --all for complete list]
   ```

4. **Offer quick actions**:
   - Open in browser
   - Add to collection
   - See who saved it
   - View related bookmarks

5. **Smart suggestions** when no results:
   - "No results for 'reakt' - did you mean 'react'?"
   - "Try searching by tag: /find #python"
   - "Browse collections: /curate list"

## Search Features

### Tag Search
```bash
/find #python #tutorial
# Shows bookmarks with both tags
```

### Collection Search
```bash
/find in:"React Resources"
# Search within a specific collection
```

### Advanced Search
```bash
/find "react hooks" saved:>5
# Bookmarks saved by more than 5 people
```

## Technical Notes

- Query SQLite with LIKE for simple matching
- Use FTS5 (Full-Text Search) for better performance if available
- Cache popular searches for speed
- Log searches to improve tag suggestions
