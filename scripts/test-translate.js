/**
 * Quick test for Google Cloud Translation API.
 * Run: node scripts/test-translate.js
 */

// Load .env manually
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [key, ...rest] = trimmed.split('=');
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
});

const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
if (!apiKey || apiKey === 'change_me_google_translate_api_key') {
  console.error('❌  GOOGLE_TRANSLATE_API_KEY is not set in .env');
  process.exit(1);
}

async function test() {
  const texts = [
    { label: 'Plain text',  input: 'আমাদের দেশ বাংলাদেশ। এটি একটি সুন্দর দেশ।' },
    { label: 'Article title', input: 'ঢাকায় বন্যার পানি কমতে শুরু করেছে' },
    { label: 'HTML content', input: '<p>আজকের <strong>প্রধান সংবাদ</strong>: দেশে নতুন বিনিয়োগ আসছে।</p>' },
  ];

  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  console.log('🔍  Testing Google Cloud Translation API (bn → en)\n');

  for (const { label, input } of texts) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: input,
          source: 'bn',
          target: 'en',
          format: label === 'HTML content' ? 'html' : 'text',
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        console.error(`❌  ${label}: API error ${res.status} — ${json?.error?.message}`);
        continue;
      }

      const translated = json?.data?.translations?.[0]?.translatedText;
      console.log(`✅  ${label}`);
      console.log(`    Input:  ${input}`);
      console.log(`    Output: ${translated}\n`);
    } catch (err) {
      console.error(`❌  ${label}: ${err.message}`);
    }
  }
}

test();
