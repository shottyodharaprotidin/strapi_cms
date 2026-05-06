/**
 * auto-translate.ts
 *
 * Translates Bengali article content to English using Google Cloud Translation API.
 * Free tier: 500,000 characters/month — https://cloud.google.com/translate/pricing
 *
 * Enable by setting in .env:
 *   GOOGLE_TRANSLATE_API_KEY=your_key
 *   AUTO_TRANSLATE_ENABLED=true
 */

import { Translate } from '@google-cloud/translate/build/src/v2/index.js';

let _client: InstanceType<typeof Translate> | null = null;

function getClient(): InstanceType<typeof Translate> | null {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) return null;
  if (!_client) {
    _client = new Translate({ key: apiKey });
  }
  return _client;
}

export function isAutoTranslateEnabled(): boolean {
  const enabled = (process.env.AUTO_TRANSLATE_ENABLED || '').toLowerCase();
  const hasKey = !!process.env.GOOGLE_TRANSLATE_API_KEY;
  return hasKey && ['true', '1', 'yes'].includes(enabled);
}

/**
 * Translate a single plain-text string from Bengali to English.
 */
export async function translateText(text: string): Promise<string> {
  if (!text?.trim()) return text;
  const client = getClient();
  if (!client) throw new Error('Google Translate client not initialized — check GOOGLE_TRANSLATE_API_KEY');

  const [translation] = await client.translate(text, { from: 'bn', to: 'en' });
  return translation;
}

/**
 * Translate an HTML string (CKEditor content) from Bengali to English.
 * Google Translate preserves HTML tags when the input contains HTML.
 */
export async function translateHtml(html: string): Promise<string> {
  if (!html?.trim()) return html;
  const client = getClient();
  if (!client) throw new Error('Google Translate client not initialized — check GOOGLE_TRANSLATE_API_KEY');

  const [translation] = await client.translate(html, {
    from: 'bn',
    to: 'en',
    format: 'html',
  });
  return translation;
}

/**
 * Generate a URL-safe English slug from a translated title.
 * e.g. "Hello World Bangladesh" → "hello-world-bangladesh"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove non-word chars
    .replace(/[\s_-]+/g, '-')   // spaces/underscores → hyphens
    .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens
}

/**
 * Translate a map of field values from Bengali to English.
 * `htmlFields` lists which keys contain HTML (CKEditor) content — the rest are plain text.
 * Returns a new object with the same keys and translated values.
 */
export async function translateFields(
  fields: Record<string, string | undefined | null>,
  htmlFields: string[] = [],
): Promise<Record<string, string>> {
  const entries = Object.entries(fields).filter(([, v]) => !!v?.trim());
  const results = await Promise.all(
    entries.map(([k, v]) =>
      htmlFields.includes(k) ? translateHtml(v!) : translateText(v!),
    ),
  );
  const out: Record<string, string> = {};
  entries.forEach(([k], i) => { out[k] = results[i]; });
  return out;
}

/**
 * Translate all localizable text fields of an article from bn-BD to English.
 * Returns an object ready to pass to strapi.documents().create() / .update()
 */
export async function translateArticle(article: {
  title?: string;
  excerpt?: string;
  content?: string;
  seo?: { metaTitle?: string; metaDescription?: string };
}): Promise<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seo?: { metaTitle: string; metaDescription: string };
}> {
  // Run independent translations in parallel to minimise latency
  const [title, excerpt, content, seoTitle, seoDescription] = await Promise.all([
    article.title   ? translateText(article.title)   : Promise.resolve(''),
    article.excerpt ? translateText(article.excerpt) : Promise.resolve(''),
    article.content ? translateHtml(article.content) : Promise.resolve(''),
    article.seo?.metaTitle       ? translateText(article.seo.metaTitle)       : Promise.resolve(''),
    article.seo?.metaDescription ? translateText(article.seo.metaDescription) : Promise.resolve(''),
  ]);

  const result: ReturnType<typeof translateArticle> extends Promise<infer T> ? T : never = {
    title,
    slug: slugify(title),
    excerpt,
    content,
  };

  if (seoTitle || seoDescription) {
    result.seo = {
      metaTitle: seoTitle || title,
      metaDescription: seoDescription || excerpt,
    };
  }

  return result;
}
