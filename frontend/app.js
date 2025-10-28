// API Base URL
const API_BASE = '/api';

// State
let bookmarks = [];
let tags = [];
let collections = [];
let currentFilter = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadBookmarks();
  loadTags();
  loadCollections();
});

// ========== Load Data ==========

async function loadBookmarks() {
  try {
    const response = await fetch(`${API_BASE}/bookmarks`);
    bookmarks = await response.json();
    renderBookmarks(bookmarks);
    updateStats();
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    showError('Failed to load bookmarks');
  }
}

async function loadTags() {
  try {
    const response = await fetch(`${API_BASE}/tags`);
    tags = await response.json();
    renderTags(tags);
  } catch (error) {
    console.error('Error loading tags:', error);
  }
}

async function loadCollections() {
  try {
    const response = await fetch(`${API_BASE}/collections`);
    collections = await response.json();
    renderCollections(collections);
  } catch (error) {
    console.error('Error loading collections:', error);
  }
}

// ========== Render Functions ==========

function renderBookmarks(bookmarksToRender) {
  const grid = document.getElementById('bookmarksGrid');
  const count = document.getElementById('bookmarkCount');

  count.textContent = `${bookmarksToRender.length} resources`;

  if (bookmarksToRender.length === 0) {
    grid.innerHTML = `
      <div class="col-span-2 text-center py-12">
        <div class="text-6xl mb-4">📚</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
        <p class="text-gray-600 mb-4">Start building your shared future by adding your first resource!</p>
        <button
          onclick="showAddModal()"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
          + Add Your First Bookmark
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = bookmarksToRender.map(bookmark => `
    <div class="bookmark-card bg-white rounded-xl shadow-sm border border-blue-100 p-5 hover:border-blue-300">
      <div class="flex items-start gap-3">
        <img
          src="${bookmark.favicon || 'https://via.placeholder.com/32'}"
          alt="favicon"
          class="w-8 h-8 rounded flex-shrink-0"
          onerror="this.src='https://via.placeholder.com/32'">
        <div class="flex-1 min-w-0">
          <a
            href="${bookmark.url}"
            target="_blank"
            class="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors block mb-1 truncate">
            ${bookmark.title}
          </a>
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">${bookmark.description || 'No description available'}</p>

          <!-- Tags -->
          ${bookmark.tags && bookmark.tags.length > 0 ? `
            <div class="flex flex-wrap gap-1 mb-3">
              ${bookmark.tags.map(tag => `
                <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200 transition-colors" onclick="filterByTag('${tag}')">
                  #${tag}
                </span>
              `).join('')}
            </div>
          ` : ''}

          <!-- Meta -->
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span class="flex items-center gap-1">
              <span class="font-medium">${getTypeEmoji(bookmark.type)}</span>
              ${bookmark.type}
            </span>
            <span>by ${bookmark.added_by}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-4 pt-4 border-t border-gray-100 flex gap-2">
        <button
          onclick="addToCollectionPrompt(${bookmark.id})"
          class="flex-1 text-sm text-gray-700 hover:text-blue-600 font-medium transition-colors">
          📁 Add to Collection
        </button>
        <button
          onclick="deleteBookmark(${bookmark.id})"
          class="text-sm text-gray-500 hover:text-red-600 transition-colors">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

function renderTags(tagsToRender) {
  const tagsList = document.getElementById('tagsList');

  if (tagsToRender.length === 0) {
    tagsList.innerHTML = '<p class="text-sm text-gray-500">No tags yet</p>';
    return;
  }

  tagsList.innerHTML = tagsToRender.map(tag => `
    <button
      onclick="filterByTag('${tag.name}')"
      class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
      ${tag.name}
      <span class="ml-1 text-xs opacity-75">${tag.count}</span>
    </button>
  `).join('');
}

function renderCollections(collectionsToRender) {
  const collectionsList = document.getElementById('collectionsList');

  if (collectionsToRender.length === 0) {
    collectionsList.innerHTML = '<p class="text-sm text-gray-500">No collections yet</p>';
    return;
  }

  collectionsList.innerHTML = collectionsToRender.map(collection => `
    <button
      onclick="viewCollection(${collection.id})"
      class="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
      <div class="font-medium text-gray-900 text-sm">${collection.name}</div>
      <div class="text-xs text-gray-500">${collection.bookmark_count} bookmarks</div>
    </button>
  `).join('');
}

function updateStats() {
  document.getElementById('statsBookmarks').textContent = `${bookmarks.length} bookmarks`;
  document.getElementById('statsTags').textContent = `${tags.length} tags`;
  document.getElementById('statsCollections').textContent = `${collections.length} collections`;
}

// ========== Actions ==========

function showAddModal() {
  document.getElementById('addModal').classList.remove('hidden');
  document.getElementById('bookmarkUrl').focus();
}

function hideAddModal() {
  document.getElementById('addModal').classList.add('hidden');
  document.getElementById('bookmarkUrl').value = '';
  document.getElementById('bookmarkTags').value = '';
  document.getElementById('bookmarkAddedBy').value = '';
  document.getElementById('addStatus').innerHTML = '';
}

async function addBookmark(event) {
  event.preventDefault();

  const url = document.getElementById('bookmarkUrl').value;
  const tagsInput = document.getElementById('bookmarkTags').value;
  const addedBy = document.getElementById('bookmarkAddedBy').value || 'anonymous';

  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

  const statusEl = document.getElementById('addStatus');
  statusEl.innerHTML = '<div class="text-blue-600">⏳ Fetching metadata and saving...</div>';

  try {
    const response = await fetch(`${API_BASE}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, tags, added_by: addedBy })
    });

    if (!response.ok) {
      throw new Error('Failed to save bookmark');
    }

    const bookmark = await response.json();
    statusEl.innerHTML = `<div class="text-green-600">✓ Saved: ${bookmark.title}</div>`;

    setTimeout(() => {
      hideAddModal();
      loadBookmarks();
      loadTags();
    }, 1500);

  } catch (error) {
    console.error('Error adding bookmark:', error);
    statusEl.innerHTML = `<div class="text-red-600">✗ Error: ${error.message}</div>`;
  }
}

async function deleteBookmark(id) {
  if (!confirm('Delete this bookmark?')) return;

  try {
    await fetch(`${API_BASE}/bookmarks/${id}`, { method: 'DELETE' });
    loadBookmarks();
    loadTags();
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    showError('Failed to delete bookmark');
  }
}

async function searchBookmarks() {
  const query = document.getElementById('searchInput').value.trim();

  if (!query) {
    renderBookmarks(bookmarks);
    document.getElementById('viewTitle').textContent = 'All Bookmarks';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    const results = await response.json();
    renderBookmarks(results);
    document.getElementById('viewTitle').textContent = `Search: "${query}"`;
  } catch (error) {
    console.error('Error searching:', error);
    showError('Search failed');
  }
}

function filterByTag(tagName) {
  const filtered = bookmarks.filter(b => b.tags && b.tags.includes(tagName));
  renderBookmarks(filtered);
  document.getElementById('viewTitle').textContent = `Tag: #${tagName}`;
}

async function viewCollection(collectionId) {
  try {
    const response = await fetch(`${API_BASE}/collections/${collectionId}/bookmarks`);
    const collectionBookmarks = await response.json();

    const collection = collections.find(c => c.id === collectionId);
    renderBookmarks(collectionBookmarks);
    document.getElementById('viewTitle').textContent = `📁 ${collection.name}`;
  } catch (error) {
    console.error('Error loading collection:', error);
    showError('Failed to load collection');
  }
}

function showCreateCollectionModal() {
  document.getElementById('collectionModal').classList.remove('hidden');
  document.getElementById('collectionName').focus();
}

function hideCollectionModal() {
  document.getElementById('collectionModal').classList.add('hidden');
  document.getElementById('collectionName').value = '';
  document.getElementById('collectionDescription').value = '';
}

async function createCollection(event) {
  event.preventDefault();

  const name = document.getElementById('collectionName').value;
  const description = document.getElementById('collectionDescription').value;

  try {
    const response = await fetch(`${API_BASE}/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });

    if (!response.ok) throw new Error('Failed to create collection');

    hideCollectionModal();
    loadCollections();
  } catch (error) {
    console.error('Error creating collection:', error);
    alert('Failed to create collection');
  }
}

async function addToCollectionPrompt(bookmarkId) {
  if (collections.length === 0) {
    alert('Create a collection first!');
    showCreateCollectionModal();
    return;
  }

  const collectionNames = collections.map((c, i) => `${i + 1}. ${c.name}`).join('\n');
  const choice = prompt(`Add to collection:\n\n${collectionNames}\n\nEnter number:`);

  if (!choice) return;

  const index = parseInt(choice) - 1;
  if (index < 0 || index >= collections.length) {
    alert('Invalid choice');
    return;
  }

  const collectionId = collections[index].id;

  try {
    await fetch(`${API_BASE}/collections/${collectionId}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmark_id: bookmarkId })
    });
    alert('Added to collection!');
  } catch (error) {
    console.error('Error adding to collection:', error);
    alert('Failed to add to collection');
  }
}

// ========== Utilities ==========

function getTypeEmoji(type) {
  const emojis = {
    'video': '🎥',
    'documentation': '📖',
    'tutorial': '🎓',
    'article': '📝',
    'tool': '🛠️',
    'website': '🌐'
  };
  return emojis[type] || '🔗';
}

function showError(message) {
  alert(message); // In production, use a toast notification
}

// Debounce search
let searchTimeout;
const originalSearchBookmarks = searchBookmarks;
searchBookmarks = function() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(originalSearchBookmarks, 300);
};
