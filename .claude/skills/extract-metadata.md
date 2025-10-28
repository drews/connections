# Extract Metadata Skill

A reusable pattern for fetching and parsing URL metadata. Use this skill whenever you need to get information about a web page.

## What This Skill Does

Given a URL, extracts:
- **Title**: From `<title>` or Open Graph tags
- **Description**: From meta description or OG description
- **Favicon**: From `<link rel="icon">` or `/favicon.ico`
- **Image**: From Open Graph image (for previews)
- **Type**: article, video, documentation, tool, etc.

## Code Pattern

```javascript
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function extractMetadata(url) {
  try {
    // Fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MultiversalBookmarks/1.0 (+https://themultiverse.school)'
      }
    });
    clearTimeout(timeout);

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract with fallbacks
    const metadata = {
      url: url,
      title: extractTitle($),
      description: extractDescription($),
      favicon: extractFavicon($, url),
      image: extractImage($, url),
      type: guessType($, url)
    };

    return metadata;

  } catch (error) {
    console.error('Metadata extraction failed:', error.message);
    return fallbackMetadata(url);
  }
}

function extractTitle($) {
  return (
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text() ||
    'Untitled'
  ).trim();
}

function extractDescription($) {
  return (
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    ''
  ).trim().slice(0, 300); // Limit length
}

function extractFavicon($, baseUrl) {
  const favicon =
    $('link[rel="icon"]').attr('href') ||
    $('link[rel="shortcut icon"]').attr('href') ||
    '/favicon.ico';

  return new URL(favicon, baseUrl).href;
}

function extractImage($, baseUrl) {
  const image =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content');

  return image ? new URL(image, baseUrl).href : null;
}

function guessType($, url) {
  const urlLower = url.toLowerCase();
  const title = $('title').text().toLowerCase();

  if (urlLower.includes('youtube.com') || urlLower.includes('vimeo.com')) {
    return 'video';
  }
  if (urlLower.includes('/docs/') || urlLower.includes('documentation')) {
    return 'documentation';
  }
  if (title.includes('tutorial') || title.includes('guide')) {
    return 'tutorial';
  }
  if ($('article').length > 0) {
    return 'article';
  }
  return 'website';
}

function fallbackMetadata(url) {
  // When scraping fails, still return something useful
  const hostname = new URL(url).hostname;
  return {
    url: url,
    title: hostname,
    description: `Resource from ${hostname}`,
    favicon: `https://www.google.com/s2/favicons?domain=${hostname}`,
    image: null,
    type: 'website'
  };
}

module.exports = { extractMetadata };
```

## Usage Examples

### In Commands
```javascript
// In /bookmark command
const { extractMetadata } = require('../skills/extract-metadata');

const metadata = await extractMetadata(userProvidedUrl);
console.log(`Found: "${metadata.title}"`);
console.log(`Description: ${metadata.description}`);
```

### In Agent
```javascript
// In bookmark-curator agent
const { extractMetadata } = require('../skills/extract-metadata');

// Refresh metadata for old bookmarks
async function updateStaleMetadata() {
  const oldBookmarks = await db.getBookmarksOlderThan(30); // days
  for (const bookmark of oldBookmarks) {
    const fresh = await extractMetadata(bookmark.url);
    if (fresh.title !== bookmark.title) {
      console.log(`📝 Updated metadata for: ${bookmark.url}`);
      await db.updateBookmark(bookmark.id, fresh);
    }
  }
}
```

### In Plugin
```javascript
// Expose as plugin utility
const { extractMetadata } = require('../skills/extract-metadata');

module.exports = {
  fetchMetadata: extractMetadata
};
```

## Error Handling

Common issues and solutions:

1. **Timeout**: Some sites are slow
   - Solution: 5-second timeout, then fallback

2. **403 Forbidden**: Site blocks scrapers
   - Solution: Use fallback with hostname

3. **Invalid HTML**: Malformed pages
   - Solution: Cheerio is forgiving, but wrap in try-catch

4. **CORS**: (not applicable for server-side, but good to know)
   - Solution: Always fetch from backend, not frontend

## Performance Tips

- Cache results for 24 hours (metadata rarely changes)
- Batch requests when processing multiple URLs
- Use HEAD request first to check if URL is valid
- Respect robots.txt for well-behaved scraping

## Testing

```javascript
// Test with various URL types
const testUrls = [
  'https://react.dev/learn',           // Documentation
  'https://www.youtube.com/watch?v=xxx', // Video
  'https://example.com/article',       // Article
  'https://nonexistent.xyz'            // Failure case
];

for (const url of testUrls) {
  const meta = await extractMetadata(url);
  console.log(`${url} -> ${meta.title} (${meta.type})`);
}
```

## Why This Is a Skill

**Reusability**: Used by commands, agents, and plugins
**Consistency**: One place to update scraping logic
**Maintainability**: Changes propagate everywhere
**Testability**: Single point to test and improve

---

**Remember**: This skill follows the DRY principle - Don't Repeat Yourself! Write once, use everywhere.
