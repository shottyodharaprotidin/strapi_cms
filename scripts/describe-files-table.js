const Database = require('better-sqlite3');
const db = new Database('./.tmp/data.db', { readonly: true });
console.log('PRAGMA table_info(files):');
console.log(db.prepare("PRAGMA table_info('files')").all());

console.log('\nSample schema (first row output):');
console.log(db.prepare('SELECT * FROM files LIMIT 1').get());

db.close();
