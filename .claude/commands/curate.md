# Curate Collection Command

You are helping the user create and manage bookmark collections.

## Your Task

### Creating Collections
```bash
/curate "Week 1: Python Basics"
```

1. **Ask for details**:
   - Collection name (provided or prompt)
   - Description (what's this for?)
   - Target audience (students, faculty, all)
   - Tags to auto-include (optional)

2. **Suggest bookmarks**:
   - Based on tags, show relevant bookmarks
   - Let user select which to include
   - Allow searching while building

3. **Organize order**:
   - Ask user to prioritize/sort bookmarks
   - Suggest logical order (basics → advanced)

4. **Save and share**:
   - Generate shareable link
   - Export as markdown list
   - Add to collections sidebar

### Listing Collections
```bash
/curate list
```

Shows all collections with stats:
```
📚 Your Collections

1. Week 1: Python Basics (12 bookmarks)
   Created by: Drew | 15 members

2. React Best Practices (8 bookmarks)
   Created by: Sarah | 24 members

3. Docker Fundamentals (6 bookmarks)
   Created by: Alex | 9 members

[Type /curate [number] to open]
```

### Managing Collections
```bash
/curate edit "Week 1: Python Basics"
```

Options:
- Add bookmarks
- Remove bookmarks
- Reorder items
- Update description
- Change visibility
- Export/share

## Example Interaction

```bash
User: /curate "React Learning Path"

You: Great! Let's build a curated collection.

Description: A structured path from React basics to advanced patterns

Target: Students (y/n)? y

I found 15 bookmarks tagged with #react. Here are the top ones:

  [ ] React Official Tutorial
  [ ] Thinking in React
  [x] React Hooks Guide (already selected)
  [ ] Component Patterns

Select bookmarks (type numbers separated by space): 1 2 4

Perfect! 4 bookmarks selected. Suggested order:

  1. React Official Tutorial (basics)
  2. Thinking in React (concepts)
  3. React Hooks Guide (modern features)
  4. Component Patterns (advanced)

Save this order? (y/n): y

✓ Collection created!
📎 Share link: http://localhost:3000/c/react-learning-path
📄 Export markdown: /curate export "React Learning Path"
```

## Smart Features

- **Auto-suggestions**: When creating "Python" collection, suggest all #python bookmarks
- **Duplicate detection**: Warn if bookmark is already in collection
- **Gap analysis**: "You have no intermediate-level bookmarks - want to search for some?"
- **Collaborative**: See who else uses this collection

## Technical Notes

- Store in `collections` and `collection_bookmarks` tables
- Generate URL-safe slugs for sharing
- Support markdown export for course syllabi
- Track usage metrics (views, forks)
