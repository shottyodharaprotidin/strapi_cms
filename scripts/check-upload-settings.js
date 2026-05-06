const path = require('path');
const Database = require('better-sqlite3');
const db = new Database(path.join(__dirname, '../.tmp/data.db'));

// Disable aiMetadata in the upload settings
const currentRow = db.prepare("SELECT value FROM strapi_core_store_settings WHERE key = 'plugin_upload_settings'").get();
if (currentRow) {
  const settings = JSON.parse(currentRow.value);
  console.log('Current settings:', settings);
  settings.aiMetadata = false;
  db.prepare("UPDATE strapi_core_store_settings SET value = ? WHERE key = 'plugin_upload_settings'").run(JSON.stringify(settings));
  console.log('Updated settings:', settings);
  console.log('Done! aiMetadata disabled in DB.');
} else {
  console.log('No upload settings row found.');
}

db.close();
