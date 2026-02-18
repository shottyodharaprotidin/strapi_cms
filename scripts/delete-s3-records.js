#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '.tmp', 'data.db');
const db = new Database(dbPath);

console.log('Checking for S3 media records in database...\n');

// Find all records that reference S3 or CDN
const s3Records = db.prepare(`
  SELECT id, document_id, name, url, provider, mime, size
  FROM files
  WHERE 
    provider = 'aws-s3'
    OR url LIKE '%shottyodharaprotidin-media.s3.%'
    OR url LIKE '%media.shottyodharaprotidin.com%'
    OR url LIKE '%amazonaws.com%'
`).all();

if (s3Records.length === 0) {
  console.log('✓ No S3 media records found in database.');
  db.close();
  process.exit(0);
}

console.log(`Found ${s3Records.length} S3 media record(s):\n`);
s3Records.forEach((record, i) => {
  console.log(`${i + 1}. ID: ${record.id}, Name: ${record.name}`);
  console.log(`   URL: ${record.url}`);
  console.log(`   Provider: ${record.provider}`);
  console.log(`   Type: ${record.mime}, Size: ${record.size} bytes\n`);
});

// Delete the records
console.log('Deleting S3 media records...');

const deleteStmt = db.prepare(`
  DELETE FROM files
  WHERE 
    provider = 'aws-s3'
    OR url LIKE '%shottyodharaprotidin-media.s3.%'
    OR url LIKE '%media.shottyodharaprotidin.com%'
    OR url LIKE '%amazonaws.com%'
`);

const result = deleteStmt.run();

console.log(`✓ Deleted ${result.changes} record(s) from files table.`);

// Check for S3 URLs in other content fields (articles, etc.)
console.log('\nSearching for S3/CDN URLs in content fields...');

const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  AND name NOT LIKE 'sqlite_%'
  AND name NOT LIKE 'strapi_%'
  AND name NOT LIKE '%_links'
`).all();

let foundInContent = false;

for (const { name: tableName } of tables) {
  try {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    const textColumns = columns
      .filter(col => col.type === 'TEXT' || col.type === 'JSON')
      .map(col => col.name);

    if (textColumns.length === 0) continue;

    for (const colName of textColumns) {
      const rows = db.prepare(`
        SELECT id, ${colName} as content
        FROM ${tableName}
        WHERE ${colName} LIKE '%shottyodharaprotidin-media.s3.%'
           OR ${colName} LIKE '%media.shottyodharaprotidin.com%'
           OR ${colName} LIKE '%amazonaws.com%'
        LIMIT 5
      `).all();

      if (rows.length > 0) {
        foundInContent = true;
        console.log(`\n⚠ Found S3 URLs in table "${tableName}", column "${colName}":`);
        rows.forEach(row => {
          const preview = String(row.content).substring(0, 150);
          console.log(`  - ID ${row.id}: ${preview}...`);
        });
      }
    }
  } catch (err) {
    // Skip tables we can't query
  }
}

if (!foundInContent) {
  console.log('✓ No S3 URLs found in content fields.');
}

db.close();
console.log('\nDone.');
