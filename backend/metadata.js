const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { URL } = require('url');

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

    if (!response.ok) {
      return fallbackMetadata(url);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const metadata = {
      url: url,
      title: extractTitle($),
      description: extractDescription($),
      favicon: extractFavicon($, url),
      image: extractImage($, url),
      type: guessType($, url)
    };

    console.log(`✓ Extracted metadata for: ${metadata.title}`);
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
  ).trim().slice(0, 300);
}

function extractFavicon($, baseUrl) {
  try {
    const favicon =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="apple-touch-icon"]').attr('href') ||
      '/favicon.ico';

    return new URL(favicon, baseUrl).href;
  } catch (e) {
    const hostname = new URL(baseUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
  }
}

function extractImage($, baseUrl) {
  try {
    const image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content');

    return image ? new URL(image, baseUrl).href : null;
  } catch (e) {
    return null;
  }
}

function guessType($, url) {
  const urlLower = url.toLowerCase();
  const title = $('title').text().toLowerCase();

  if (urlLower.includes('youtube.com') || urlLower.includes('vimeo.com') || urlLower.includes('youtu.be')) {
    return 'video';
  }
  if (urlLower.includes('/docs/') || urlLower.includes('documentation') || title.includes('documentation')) {
    return 'documentation';
  }
  if (title.includes('tutorial') || title.includes('guide') || title.includes('how to')) {
    return 'tutorial';
  }
  if (urlLower.includes('github.com') || urlLower.includes('gitlab.com')) {
    return 'tool';
  }
  if ($('article').length > 0) {
    return 'article';
  }
  return 'website';
}

function fallbackMetadata(url) {
  try {
    const hostname = new URL(url).hostname;
    return {
      url: url,
      title: hostname,
      description: `Resource from ${hostname}`,
      favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
      image: null,
      type: 'website'
    };
  } catch (e) {
    return {
      url: url,
      title: 'Unknown Resource',
      description: '',
      favicon: null,
      image: null,
      type: 'website'
    };
  }
}

module.exports = { extractMetadata };
