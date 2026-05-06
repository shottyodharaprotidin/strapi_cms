'use strict';
/**
 * Fixes orphaned EN article locales and backfills translations for all current BN-BD articles.
 *
 * Steps:
 *  1. Collect all current bn-BD article documentIds
 *  2. Collect all en article documentIds
 *  3. Delete EN articles whose documentId is NOT in the bn-BD set (orphans)
 *  4. For current bn-BD articles that have no EN locale, touch them via PUT to trigger afterUpdate → auto-translate
 *
 * Usage:  node scripts/fix-article-translations.js
 */

const BASE_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const EMAIL    = process.env.STRAPI_ADMIN_EMAIL    || 'admin@shottyodharaprotidin.com';
const PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'Rasel.526511';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function login() {
  const res  = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  if (!data.data?.token) throw new Error('Login failed: ' + JSON.stringify(data?.error));
  console.log('✓ Logged in');
  return data.data.token;
}

async function getAllArticles(token, locale) {
  let page = 1, allResults = [];
  while (true) {
    const res = await fetch(
      `${BASE_URL}/content-manager/collection-types/api::article.article?locale=${locale}&page=${page}&pageSize=100`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    const results = data?.results ?? [];
    allResults = allResults.concat(results);
    if (results.length < 100) break;
    page++;
  }
  return allResults;
}

async function deleteArticle(token, documentId) {
  const res = await fetch(
    `${BASE_URL}/content-manager/collection-types/api::article.article/${documentId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  );
  return res.ok;
}

async function touchArticle(token, article) {
  // PUT with just the title field to trigger afterUpdate lifecycle
  const res = await fetch(
    `${BASE_URL}/content-manager/collection-types/api::article.article/${article.documentId}?locale=bn-BD`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: article.title }),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.log(`    ✗ PUT failed: ${err?.error?.message || res.status}`);
    return false;
  }
  return true;
}

async function hasEnLocale(token, documentId) {
  const res = await fetch(
    `${BASE_URL}/content-manager/collection-types/api::article.article/${documentId}?locale=en`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) return false;
  const d = await res.json();
  return !!(d?.data?.id || d?.id);
}

async function main() {
  const token = await login();

  // ── Step 1: Collect current documentIds ────────────────────────────────────
  console.log('\n📋 Collecting articles...');
  const bnArticles = await getAllArticles(token, 'bn-BD');
  const enArticles = await getAllArticles(token, 'en');
  console.log(`  bn-BD: ${bnArticles.length} articles`);
  console.log(`  en:    ${enArticles.length} articles`);

  const bnDocIds = new Set(bnArticles.map(a => a.documentId));
  const enOrphans = enArticles.filter(a => !bnDocIds.has(a.documentId));
  console.log(`  Orphaned EN articles (no BN counterpart): ${enOrphans.length}`);

  // ── Step 2: Delete orphaned EN articles ────────────────────────────────────
  if (enOrphans.length > 0) {
    console.log('\n🗑  Deleting orphaned EN articles...');
    for (const article of enOrphans) {
      const ok = await deleteArticle(token, article.documentId);
      console.log(`  ${ok ? '✓' : '✗'} deleted "${article.title || article.documentId}"`);
      await sleep(200);
    }
  }

  // ── Step 3: Touch BN articles that have no EN locale ──────────────────────
  console.log('\n🔄 Re-triggering auto-translate for BN articles without EN locale...');
  let touchCount = 0;
  for (const article of bnArticles) {
    const hasEn = await hasEnLocale(token, article.documentId);
    if (hasEn) {
      console.log(`  ↩ "${article.title?.slice(0, 50)}" — EN already exists, skipping`);
      continue;
    }
    const ok = await touchArticle(token, article);
    console.log(`  ${ok ? '✓' : '✗'} touched "${article.title?.slice(0, 50)}" → auto-translate will fire`);
    touchCount++;
    await sleep(1500); // give auto-translate time to process + avoid flooding Google Translate
  }

  console.log(`\n✅ Done! Deleted ${enOrphans.length} orphaned EN articles, triggered ${touchCount} translations`);
  console.log('   Check Strapi logs for "Auto-translate:" entries');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
