/**
 * Fixes a Strapi v5 bug on Windows where path.relative() produces backslashes
 * in the admin entry path, breaking the <script src="..."> tag in the browser.
 *
 * This patches both CJS and ESM builds of create-build-context in @strapi/strapi.
 */
const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', 'node_modules', '@strapi', 'strapi', 'dist', 'src', 'node', 'create-build-context.js'),
  path.join(__dirname, '..', 'node_modules', '@strapi', 'strapi', 'dist', 'src', 'node', 'create-build-context.mjs'),
];

const target = "path.relative(cwd, path.join(runtimeDir, 'app.js'))";
const replacement = "path.relative(cwd, path.join(runtimeDir, 'app.js')).replace(/\\\\/g, '/')";

let patched = 0;
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes(replacement)) {
    console.log(`[fix-windows-paths] Already patched: ${path.basename(file)}`);
    continue;
  }
  if (!content.includes(target)) {
    console.log(`[fix-windows-paths] Target not found in: ${path.basename(file)}`);
    continue;
  }
  fs.writeFileSync(file, content.replace(target, replacement), 'utf8');
  console.log(`[fix-windows-paths] Patched: ${path.basename(file)}`);
  patched++;
}

console.log(`[fix-windows-paths] Done. ${patched} file(s) patched.`);
