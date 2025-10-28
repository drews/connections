# Add Bookmark Command

You are helping the user add a new bookmark to the multiversal bookmarks system.

## Your Task

1. **Extract the URL** from the user's command (everything after `/bookmark`)

2. **Fetch metadata** intelligently:
   - Visit the URL and extract: title, description, favicon
   - Use the `extract-metadata` skill from `.claude/skills/`
   - Handle errors gracefully (some sites block scrapers)

3. **Suggest smart tags**:
   - Analyze the content and suggest 2-4 relevant tags
   - Common tags: `react`, `python`, `docker`, `tutorial`, `documentation`, `tool`, `article`, `video`
   - Match existing tags from database when possible

4. **Check for duplicates**:
   - Use the `detect-duplicates` skill
   - If similar bookmark exists, inform user and ask if they want to proceed

5. **Save to database**:
   - Insert into `bookmarks` table
   - Create/link tags in `bookmark_tags` table
   - Show confirmation with the bookmark details

6. **Provide quick actions**:
   - Offer to add to a collection
   - Suggest related existing bookmarks

## Example Interaction

```bash
User: /bookmark https://react.dev/learn/thinking-in-react

You: Fetching metadata from react.dev...

✓ Found: "Thinking in React – React"
✓ Description: Learn how to think about building UIs with React
✓ Suggested tags: react, tutorial, documentation

Checking for duplicates... No similar bookmarks found.

Bookmark saved! #42

Would you like to:
  1. Add to "React Resources" collection
  2. Find similar bookmarks
  3. Done
```

## Technical Notes

- Use `node-fetch` to get the page
- Use `cheerio` to parse HTML for meta tags
- Check `<title>`, `<meta name="description">`, `<link rel="icon">`
- Store in SQLite database at `bookmarks.db`
- Added by: Use git config user.name or prompt for name
