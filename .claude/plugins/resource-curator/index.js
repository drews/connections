/**
 * Resource Curator Plugin
 *
 * Exposes bookmark utilities for external integrations
 */

const path = require('path');
const fs = require('fs');

// Import skills
const { extractMetadata } = require('../../skills/extract-metadata');
const { detectDuplicates, normalizeUrl } = require('../../skills/detect-duplicates');

// Database connection (lazy loaded)
let db = null;

function getDatabase() {
  if (!db) {
    // In a real implementation, this would connect to the SQLite database
    // For now, we'll stub it
    const Database = require('../../../backend/database');
    db = new Database();
  }
  return db;
}

/**
 * Fetch metadata for a given URL
 * @param {string} url - The URL to analyze
 * @returns {Promise<Metadata>}
 */
async function fetchMetadata(url) {
  return await extractMetadata(url);
}

/**
 * Find bookmarks similar to the given URL
 * @param {string} url - URL to check against
 * @returns {Promise<Bookmark[]>}
 */
async function findSimilar(url) {
  const database = getDatabase();
  const existing = await database.getAllBookmarks();
  const metadata = await fetchMetadata(url);

  const results = await detectDuplicates(metadata, existing);

  return [
    ...results.exact,
    ...results.similar.map(s => s.bookmark)
  ];
}

/**
 * Search through all bookmarks
 * @param {string} query - Search terms
 * @param {object} options - Optional filters
 * @returns {Promise<Bookmark[]>}
 */
async function search(query, options = {}) {
  const database = getDatabase();
  return await database.search(query, options);
}

/**
 * Create a new bookmark collection
 * @param {object} config - Collection configuration
 * @returns {Promise<Collection>}
 */
async function createCollection(config) {
  const database = getDatabase();

  const collection = await database.createCollection({
    name: config.name,
    description: config.description || '',
    created_by: config.createdBy || 'system'
  });

  if (config.autoPopulate && config.tags) {
    const bookmarks = await database.getBookmarksByTags(config.tags);
    for (const bookmark of bookmarks) {
      await database.addToCollection(collection.id, bookmark.id);
    }
  }

  return collection;
}

/**
 * Export collection as Markdown
 * @param {number} collectionId - Collection to export
 * @returns {Promise<string>}
 */
async function exportAsMarkdown(collectionId) {
  const database = getDatabase();
  const collection = await database.getCollection(collectionId);
  const bookmarks = await database.getCollectionBookmarks(collectionId);

  let markdown = `# ${collection.name}\n\n`;

  if (collection.description) {
    markdown += `${collection.description}\n\n`;
  }

  bookmarks.forEach((bookmark, index) => {
    markdown += `${index + 1}. [${bookmark.title}](${bookmark.url})\n`;
    if (bookmark.description) {
      markdown += `   > ${bookmark.description}\n`;
    }
    if (bookmark.tags && bookmark.tags.length > 0) {
      markdown += `   Tags: ${bookmark.tags.map(t => `\`${t}\``).join(', ')}\n`;
    }
    markdown += '\n';
  });

  return markdown;
}

/**
 * Export collection as JSON
 * @param {number} collectionId - Collection to export
 * @returns {Promise<object>}
 */
async function exportAsJSON(collectionId) {
  const database = getDatabase();
  const collection = await database.getCollection(collectionId);
  const bookmarks = await database.getCollectionBookmarks(collectionId);

  return {
    name: collection.name,
    description: collection.description,
    created_at: collection.created_at,
    bookmark_count: bookmarks.length,
    bookmarks: bookmarks.map(b => ({
      title: b.title,
      url: b.url,
      description: b.description,
      tags: b.tags,
      added_by: b.added_by,
      created_at: b.created_at
    }))
  };
}

/**
 * Export collection as HTML
 * @param {number} collectionId - Collection to export
 * @returns {Promise<string>}
 */
async function exportAsHTML(collectionId) {
  const database = getDatabase();
  const collection = await database.getCollection(collectionId);
  const bookmarks = await database.getCollectionBookmarks(collectionId);

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${collection.name}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      line-height: 1.6;
    }
    h1 { color: #2563eb; }
    .bookmark {
      margin: 20px 0;
      padding: 15px;
      border-left: 3px solid #2563eb;
      background: #f8fafc;
    }
    .bookmark-title {
      font-size: 1.2em;
      font-weight: 600;
      color: #1e293b;
      text-decoration: none;
    }
    .bookmark-title:hover { color: #2563eb; }
    .bookmark-desc {
      margin: 8px 0;
      color: #64748b;
    }
    .tags {
      margin-top: 8px;
    }
    .tag {
      display: inline-block;
      padding: 2px 8px;
      margin: 2px;
      background: #e0e7ff;
      color: #3730a3;
      border-radius: 4px;
      font-size: 0.85em;
    }
  </style>
</head>
<body>
  <h1>${collection.name}</h1>
  ${collection.description ? `<p>${collection.description}</p>` : ''}

  <div class="bookmarks">
`;

  bookmarks.forEach(bookmark => {
    html += `
    <div class="bookmark">
      <a href="${bookmark.url}" class="bookmark-title" target="_blank">${bookmark.title}</a>
      ${bookmark.description ? `<div class="bookmark-desc">${bookmark.description}</div>` : ''}
      ${bookmark.tags && bookmark.tags.length > 0 ? `
        <div class="tags">
          ${bookmark.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      ` : ''}
    </div>
`;
  });

  html += `
  </div>
</body>
</html>
`;

  return html;
}

/**
 * Normalize a URL for comparison
 * @param {string} url - URL to normalize
 * @returns {string}
 */
function normalize(url) {
  return normalizeUrl(url);
}

module.exports = {
  fetchMetadata,
  findSimilar,
  search,
  createCollection,
  exportAsMarkdown,
  exportAsJSON,
  exportAsHTML,
  normalize
};
