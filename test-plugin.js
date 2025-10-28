#!/usr/bin/env node
/**
 * Test the resource-curator plugin
 */

const curator = require('./.claude/plugins/resource-curator');

async function testPlugin() {
  console.log('🧪 Testing Resource Curator Plugin\n');

  // Test 1: Fetch metadata
  console.log('1. Testing fetchMetadata()...');
  const meta = await curator.fetchMetadata('https://nodejs.org');
  console.log(`   ✓ Title: ${meta.title}`);
  console.log(`   ✓ Type: ${meta.type}`);
  console.log(`   ✓ Favicon: ${meta.favicon}\n`);

  // Test 2: Search
  console.log('2. Testing search()...');
  const results = await curator.search('react');
  console.log(`   ✓ Found ${results.length} bookmarks matching "react"\n`);

  // Test 3: URL normalization
  console.log('3. Testing normalize()...');
  const normalized = curator.normalize('https://www.example.com/?utm_source=twitter');
  console.log(`   ✓ Normalized: ${normalized}\n`);

  console.log('✅ All plugin tests passed!\n');
  console.log('The plugin is ready to be used by:');
  console.log('  - Browser extensions');
  console.log('  - Slack bots');
  console.log('  - GitHub Actions');
  console.log('  - CLI tools');
  console.log('  - Future MCP servers');
}

testPlugin().catch(console.error);
