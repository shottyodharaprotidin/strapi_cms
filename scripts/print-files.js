const Database = require('better-sqlite3');
const dbPath = `${__dirname.replace(/\\/g, '/')}/../.tmp/data.db`;
const db = new Database(dbPath, { readonly: true });

const rows = db.prepare('SELECT id, name, url, caption, provider FROM files ORDER BY id DESC LIMIT 100').all();
console.log(`Found ${rows.length} files (showing up to 100):`);
rows.forEach(r => console.log(r));

db.close();
