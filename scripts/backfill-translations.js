'use strict';

/**
 * Backfill English locale for all existing bn-BD content types
 * that don't have an English version yet.
 *
 * Usage:  node scripts/backfill-translations.js
 *
 * Requires Strapi to be RUNNING on localhost:1337.
 * Uses the admin API (touch via PUT) to trigger the afterUpdate lifecycle.
 */

const BASE_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const EMAIL    = process.env.STRAPI_ADMIN_EMAIL    || 'admin@shottyodharaprotidin.com';
const PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'Rasel.526511';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

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

async function getAll(token, uid, locale = 'bn-BD') {
  const res  = await fetch(
    `${BASE_URL}/content-manager/collection-types/${uid}?locale=${locale}&pageSize=100`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = await res.json();
  return data?.results ?? [];
}

async function getSingle(token, uid, locale = 'bn-BD') {
  const res = await fetch(
    `${BASE_URL}/content-manager/single-types/${uid}?locale=${locale}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (res.status === 404) return null;
  return (await res.json())?.data ?? null;
}

async function checkEnLocale(token, uid, documentId, kind = 'collection') {
  const path = kind === 'single'
    ? `${BASE_URL}/content-manager/single-types/${uid}?locale=en`
    : `${BASE_URL}/content-manager/collection-types/${uid}/${documentId}?locale=en`;
  const res = await fetch(path, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 404) return false;
  const data = await res.json();
  const doc  = data?.data ?? data;
  return !!(doc?.id);
}

async function touch(token, uid, documentId, data, locale = 'bn-BD') {
  const res = await fetch(
    `${BASE_URL}/content-manager/collection-types/${uid}/${documentId}?locale=${locale}`,
    {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    },
  );
  return res.ok;
}

async function touchSingle(token, uid, data, locale = 'bn-BD') {
  const res = await fetch(
    `${BASE_URL}/content-manager/single-types/${uid}?locale=${locale}`,
    {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    },
  );
  return res.ok;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── CONTENT TYPE SPECS ───────────────────────────────────────────────────────

const COLLECTION_TYPES = [
  {
    uid: 'api::category.category',
    pickFields: (d) => ({
      name: d.name, slug: d.slug,
      isTrending: d.isTrending, isSidebar: d.isSidebar, sortOrder: d.sortOrder,
    }),
  },
  {
    uid: 'api::author.author',
    pickFields: (d) => ({ name: d.name, display_name: d.display_name, Slug: d.Slug }),
  },
];

const SINGLE_TYPES = [
  {
    uid: 'api::global.global',
    pickFields: (d) => ({ siteName: d.siteName, siteDescription: d.siteDescription }),
  },
  {
    uid: 'api::about.about',
    pickFields: (d) => ({
      title: d.title, heroDescription: d.heroDescription,
      missionTitle: d.missionTitle, missionSubtitle: d.missionSubtitle,
    }),
  },
  {
    uid: 'api::privacy-policy.privacy-policy',
    pickFields: (d) => ({ title: d.title, heroDescription: d.heroDescription }),
  },
  {
    uid: 'api::not-found.not-found',
    pickFields: (d) => ({
      notFoundTitle: d.notFoundTitle, notFoundSubtitle: d.notFoundSubtitle,
      notFoundButtonLabel: d.notFoundButtonLabel,
    }),
  },
  {
    uid: 'api::footer.footer',
    pickFields: (d) => ({
      description: d.description, copyrightText: d.copyrightText,
      categoryTitle: d.categoryTitle, recentPostTitle: d.recentPostTitle,
    }),
  },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const token = await login();

  // ── Collection types ────────────────────────────────────────────────────────
  for (const spec of COLLECTION_TYPES) {
    const items = await getAll(token, spec.uid);
    console.log(`\n${spec.uid}: ${items.length} bn-BD entries found`);

    for (const item of items) {
      const hasEn = await checkEnLocale(token, spec.uid, item.documentId);
      if (hasEn) {
        console.log(`  ↩ ${item.name ?? item.title ?? item.documentId} — English already exists, skipping`);
        continue;
      }

      const ok = await touch(token, spec.uid, item.documentId, spec.pickFields(item));
      console.log(`  ${ok ? '✓' : '✗'} touched "${item.name ?? item.documentId}" → lifecycle will create en locale`);
      await sleep(1200); // avoid flooding Google Translate
    }
  }

  // ── Single types ────────────────────────────────────────────────────────────
  for (const spec of SINGLE_TYPES) {
    const item = await getSingle(token, spec.uid);
    if (!item) { console.log(`\n${spec.uid}: no bn-BD entry found, skipping`); continue; }

    const hasEn = await checkEnLocale(token, spec.uid, item.documentId, 'single');
    if (hasEn) {
      console.log(`\n${spec.uid}: English already exists, skipping`);
      continue;
    }

    const ok = await touchSingle(token, spec.uid, spec.pickFields(item));
    console.log(`\n${spec.uid}: ${ok ? '✓' : '✗'} touched → lifecycle will create en locale`);
    await sleep(1200);
  }

  console.log('\n✅ Backfill complete — check Strapi logs for "Auto-translate:" entries\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
