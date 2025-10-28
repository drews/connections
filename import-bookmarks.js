const fs = require('fs');

const API_BASE = 'http://localhost:3000/api';
const COLLECTION_ID = 2;

// Read URLs
const urls = fs.readFileSync('filtered-urls.txt', 'utf-8')
  .split('\n')
  .filter(url => url.trim().length > 0);

console.log(`📚 Found ${urls.length} URLs to import`);

// Benchmark function
async function benchmarkBatch(batchSize, testUrls) {
  console.log(`\n⏱️  Testing batch size: ${batchSize}`);
  const start = Date.now();

  const promises = [];
  for (let i = 0; i < testUrls.length; i += batchSize) {
    const batch = testUrls.slice(i, i + batchSize);

    const batchPromises = batch.map(url =>
      fetch(`${API_BASE}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, added_by: 'drewby' })
      })
      .then(res => res.json())
      .catch(err => ({ error: err.message, url }))
    );

    const results = await Promise.all(batchPromises);
    const successes = results.filter(r => !r.error).length;
    const failures = results.filter(r => r.error).length;

    console.log(`  Batch ${Math.floor(i/batchSize) + 1}: ${successes} success, ${failures} failed`);
  }

  const duration = Date.now() - start;
  const avgPerUrl = duration / testUrls.length;

  console.log(`  ✓ Completed in ${duration}ms (${avgPerUrl.toFixed(0)}ms per URL)`);

  return { batchSize, duration, avgPerUrl };
}

// Main execution
async function main() {
  // Test with first 16 URLs across different batch sizes
  const testUrls = urls.slice(0, 16);
  const batchSizes = [2, 4, 8, 16];
  const results = [];

  console.log('\n🧪 Running benchmarks...\n');

  for (const size of batchSizes) {
    const result = await benchmarkBatch(size, testUrls);
    results.push(result);

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Find optimal batch size
  console.log('\n📊 Results:');
  console.log('─'.repeat(50));
  results.forEach(r => {
    console.log(`Batch ${r.batchSize}: ${r.avgPerUrl.toFixed(0)}ms/url (${r.duration}ms total)`);
  });

  const optimal = results.reduce((best, curr) =>
    curr.avgPerUrl < best.avgPerUrl ? curr : best
  );

  console.log('\n🎯 Optimal batch size:', optimal.batchSize);

  // Ask if user wants to proceed with full import
  console.log(`\n📦 Ready to import remaining ${urls.length - 16} URLs?`);
  console.log(`   Using batch size: ${optimal.batchSize}`);
  console.log(`   Estimated time: ${Math.round((urls.length - 16) * optimal.avgPerUrl / 1000)}s`);
  console.log('\nRun: node import-bookmarks.js --full-import');
}

// Handle full import
async function fullImport() {
  console.log('🚀 Starting full import...\n');

  let imported = 0;
  let failed = 0;
  const start = Date.now();
  const BATCH_SIZE = 8; // Use optimal from benchmark

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(url =>
        fetch(`${API_BASE}/bookmarks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, added_by: 'drewby' })
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            // Check if it's a duplicate (UNIQUE constraint)
            if (data.error.includes('UNIQUE') || data.error.includes('constraint')) {
              return { skipped: true, url, reason: 'duplicate' };
            }
            throw new Error(data.error);
          }

          // Add to collection
          return fetch(`${API_BASE}/collections/${COLLECTION_ID}/bookmarks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookmark_id: data.id })
          })
          .then(() => ({ success: true, url }));
        })
        .catch(err => ({ error: err.message, url }))
      )
    );

    const batchSuccess = results.filter(r => r.success).length;
    const batchFailed = results.filter(r => r.error).length;
    const batchSkipped = results.filter(r => r.skipped).length;

    imported += batchSuccess;
    failed += batchFailed;

    const progress = Math.round((i + batch.length) / urls.length * 100);
    console.log(`[${progress}%] Batch ${Math.floor(i/BATCH_SIZE) + 1}: +${batchSuccess} imported, ${batchSkipped} skipped, ${failed} failed total`);

    if (batchFailed > 0) {
      results.filter(r => r.error).forEach(r => {
        console.log(`  ⚠️  Failed: ${r.url} - ${r.error}`);
      });
    }
  }

  const duration = Math.round((Date.now() - start) / 1000);

  console.log(`\n✅ Import complete!`);
  console.log(`   Imported: ${imported}/${urls.length}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Duration: ${duration}s`);
}

// CLI handling
if (process.argv.includes('--full-import')) {
  fullImport().catch(console.error);
} else {
  main().catch(console.error);
}
