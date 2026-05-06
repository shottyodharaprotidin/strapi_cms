const fs = require('node:fs');
const path = require('node:path');

const desiredTitle = 'সত্যধারা প্রতিদিন';
const targets = [
  path.join(process.cwd(), 'dist', 'build', 'index.html'),
  path.join(process.cwd(), '.strapi', 'client', 'index.html'),
];

const setTitle = (html) => {
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${desiredTitle}</title>`);
  }

  return html.replace(/<head>/i, `<head><title>${desiredTitle}</title>`);
};

for (const file of targets) {
  if (!fs.existsSync(file)) {
    continue;
  }

  const before = fs.readFileSync(file, 'utf8');
  const after = setTitle(before);

  if (before !== after) {
    fs.writeFileSync(file, after, 'utf8');
    console.log(`Patched title in ${path.relative(process.cwd(), file)}`);
  }
}
