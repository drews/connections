# Detect Duplicates Skill

A reusable pattern for finding similar bookmarks before adding new ones. Prevents clutter and helps maintain collection quality.

## What This Skill Does

Given a new URL or metadata, finds:
- **Exact duplicates**: Same URL (with normalization)
- **Similar URLs**: Different parameters or protocols
- **Same content**: Different sources hosting identical content
- **Related resources**: Similar topics but different angles

## Code Pattern

```javascript
const { URL } = require('url');

async function detectDuplicates(newBookmark, existingBookmarks) {
  const results = {
    exact: [],
    similar: [],
    related: []
  };

  const normalizedNew = normalizeUrl(newBookmark.url);

  for (const existing of existingBookmarks) {
    const normalizedExisting = normalizeUrl(existing.url);

    // Check exact match
    if (normalizedNew === normalizedExisting) {
      results.exact.push(existing);
      continue;
    }

    // Check similar URLs
    const similarity = calculateUrlSimilarity(normalizedNew, normalizedExisting);
    if (similarity > 0.8) {
      results.similar.push({ bookmark: existing, similarity });
      continue;
    }

    // Check content similarity
    const contentSim = calculateContentSimilarity(newBookmark, existing);
    if (contentSim > 0.7) {
      results.related.push({ bookmark: existing, similarity: contentSim });
    }
  }

  // Sort by similarity
  results.similar.sort((a, b) => b.similarity - a.similarity);
  results.related.sort((a, b) => b.similarity - a.similarity);

  return results;
}

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);

    // Remove www
    let hostname = parsed.hostname.replace(/^www\./, '');

    // Force https
    const protocol = 'https:';

    // Remove trailing slash
    let pathname = parsed.pathname.replace(/\/$/, '');

    // Sort query parameters
    const params = new URLSearchParams(parsed.search);
    const sortedParams = new URLSearchParams(
      [...params.entries()].sort()
    );

    // Remove common tracking params
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'source'];
    trackingParams.forEach(param => sortedParams.delete(param));

    const search = sortedParams.toString() ? `?${sortedParams.toString()}` : '';

    return `${protocol}//${hostname}${pathname}${search}`;
  } catch (e) {
    return url; // Return original if parsing fails
  }
}

function calculateUrlSimilarity(url1, url2) {
  // Levenshtein distance for URL similarity
  const len1 = url1.length;
  const len2 = url2.length;
  const matrix = Array(len1 + 1).fill(null).map(() =>
    Array(len2 + 1).fill(null)
  );

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = url1[i - 1] === url2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - (distance / maxLen);
}

function calculateContentSimilarity(bookmark1, bookmark2) {
  // Simple content similarity based on title and description
  const title1 = (bookmark1.title || '').toLowerCase();
  const title2 = (bookmark2.title || '').toLowerCase();
  const desc1 = (bookmark1.description || '').toLowerCase();
  const desc2 = (bookmark2.description || '').toLowerCase();

  // Title similarity (weighted higher)
  const titleSim = jaccardSimilarity(
    title1.split(/\s+/),
    title2.split(/\s+/)
  );

  // Description similarity
  const descSim = jaccardSimilarity(
    desc1.split(/\s+/),
    desc2.split(/\s+/)
  );

  // Tag overlap
  const tags1 = new Set(bookmark1.tags || []);
  const tags2 = new Set(bookmark2.tags || []);
  const tagSim = jaccardSimilarity(
    Array.from(tags1),
    Array.from(tags2)
  );

  // Weighted average
  return (titleSim * 0.5) + (descSim * 0.3) + (tagSim * 0.2);
}

function jaccardSimilarity(set1, set2) {
  const a = new Set(set1);
  const b = new Set(set2);
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

module.exports = {
  detectDuplicates,
  normalizeUrl,
  calculateUrlSimilarity,
  calculateContentSimilarity
};
```

## Usage Examples

### In /bookmark Command
```javascript
const { detectDuplicates } = require('../skills/detect-duplicates');

async function addBookmark(url) {
  const metadata = await extractMetadata(url);
  const existing = await db.getAllBookmarks();
  const dupes = await detectDuplicates(metadata, existing);

  if (dupes.exact.length > 0) {
    console.log('❌ This bookmark already exists!');
    console.log(`   Added by: ${dupes.exact[0].added_by}`);
    return;
  }

  if (dupes.similar.length > 0) {
    console.log('⚠️  Similar bookmarks found:');
    dupes.similar.forEach((dup, i) => {
      console.log(`   ${i + 1}. ${dup.bookmark.title}`);
      console.log(`      ${dup.bookmark.url}`);
      console.log(`      Similarity: ${(dup.similarity * 100).toFixed(0)}%`);
    });

    const answer = await askUser('Add anyway? (y/n)');
    if (answer !== 'y') return;
  }

  await db.insertBookmark(metadata);
  console.log('✓ Bookmark saved!');
}
```

### In bookmark-curator Agent
```javascript
const { detectDuplicates } = require('../skills/detect-duplicates');

async function dailyDuplicateCheck() {
  const bookmarks = await db.getAllBookmarks();
  const duplicateGroups = [];

  for (let i = 0; i < bookmarks.length; i++) {
    for (let j = i + 1; j < bookmarks.length; j++) {
      const result = await detectDuplicates(
        bookmarks[i],
        [bookmarks[j]]
      );

      if (result.exact.length > 0 || result.similar.length > 0) {
        duplicateGroups.push([bookmarks[i], bookmarks[j]]);
      }
    }
  }

  if (duplicateGroups.length > 0) {
    console.log(`🔍 Found ${duplicateGroups.length} potential duplicates`);
    console.log('   Review and merge with: /curator merge-duplicates');
  }
}
```

### In Tests
```javascript
const { normalizeUrl, calculateUrlSimilarity } = require('../skills/detect-duplicates');

// Test URL normalization
const tests = [
  ['https://example.com/', 'https://example.com'],
  ['http://www.example.com', 'https://example.com'],
  ['https://example.com?utm_source=twitter', 'https://example.com']
];

tests.forEach(([input, expected]) => {
  const result = normalizeUrl(input);
  console.assert(result === expected, `Failed: ${input} -> ${result} (expected ${expected})`);
});

// Test similarity
const similarity = calculateUrlSimilarity(
  'https://react.dev/learn/thinking-in-react',
  'https://reactjs.org/docs/thinking-in-react.html'
);
console.log(`Similarity: ${(similarity * 100).toFixed(0)}%`); // Should be high
```

## URL Normalization Rules

1. **Protocol**: Always use `https://`
2. **www**: Remove `www.` prefix
3. **Trailing slash**: Remove from paths
4. **Query params**: Sort alphabetically
5. **Tracking params**: Remove utm_*, ref, source
6. **Fragments**: Keep them (they might be meaningful)

## Duplicate Detection Levels

### Exact (100% match)
- Same normalized URL
- Action: Reject immediately

### Similar (80%+ match)
- Different protocols/subdomains
- Different tracking parameters
- Nearly identical paths
- Action: Warn user, offer merge

### Related (70%+ match)
- Similar titles/descriptions
- Overlapping tags
- Same domain but different pages
- Action: Show as "you might also like"

## Performance Considerations

- **For small collections** (<1000): Check all bookmarks
- **For large collections**: Use indexing
  - Index by domain for quick lookups
  - Cache normalized URLs
  - Use database full-text search

## Why This Is a Skill

**Quality Control**: Keeps collection clean
**User Experience**: Prevents frustration of duplicates
**Reusability**: Used by commands and agent
**Configurable**: Similarity thresholds can be tuned

---

**Pro tip**: Run duplicate detection as a background task nightly to catch any that slipped through!
