import type { Core } from '@strapi/strapi';
import { isAutoTranslateEnabled, translateArticle, translateFields, slugify } from './services/auto-translate.js';

const HEADER_UID = 'api::header.header';

const VALID_MENU_SUFFIXES = new Set([
  'base-link',
  'menu-button',
  'dropdown-menu',
  'dropdown-header',
  'nested-dropdown',
  'mega-menu',
  'video-menu',
]);

function normalizeMenuComponent(component: unknown) {
  if (typeof component !== 'string') {
    return component;
  }

  const trimmedComponent = component.trim();
  const suffix = trimmedComponent.split('.').pop();

  if (suffix && VALID_MENU_SUFFIXES.has(suffix)) {
    return `navigation.${suffix}`;
  }

  return trimmedComponent;
}

function normalizeMenuUrl(value: unknown) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue || trimmedValue === '#') {
    return '#';
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return trimmedValue.replace(/\s+/g, '');
}

function normalizeBooleanFlag(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['true', '1', 'yes', 'on'].includes(normalized);
  }
  return false;
}

function normalizeMenuNode(node: any): { node: any; changed: boolean } {
  if (!node || typeof node !== 'object') {
    return { node, changed: false };
  }

  let changed = false;
  const output: any = { ...node };

  const normalizedComponent = normalizeMenuComponent(output.__component);
  if (normalizedComponent !== output.__component) {
    output.__component = normalizedComponent;
    changed = true;
  }

  const normalizedUrl = normalizeMenuUrl(output.url);
  if (normalizedUrl !== output.url) {
    output.url = normalizedUrl;
    changed = true;
  }

  if (Object.prototype.hasOwnProperty.call(output, 'slug')) {
    const normalizedSlug = normalizeMenuUrl(output.slug);
    if (normalizedSlug !== output.slug) {
      output.slug = normalizedSlug;
      changed = true;
    }
  }

  const typoFlag = output.oopenInNewTab ?? output.openInNeewTab;
  if (typoFlag !== undefined || output.openInNewTab !== undefined) {
    const normalizedOpenInNewTab = normalizeBooleanFlag(
      output.openInNewTab ?? typoFlag
    );

    if (output.openInNewTab !== normalizedOpenInNewTab) {
      output.openInNewTab = normalizedOpenInNewTab;
      changed = true;
    }

    if (Object.prototype.hasOwnProperty.call(output, 'oopenInNewTab')) {
      delete output.oopenInNewTab;
      changed = true;
    }

    if (Object.prototype.hasOwnProperty.call(output, 'openInNeewTab')) {
      delete output.openInNeewTab;
      changed = true;
    }
  }

  if (Array.isArray(output.subMenus)) {
    const nextSubMenus = output.subMenus.map((child: any) => normalizeMenuNode(child));
    if (nextSubMenus.some((item) => item.changed)) {
      output.subMenus = nextSubMenus.map((item) => item.node);
      changed = true;
    }
  }

  if (Array.isArray(output.sections)) {
    const nextSections = output.sections.map((section: any) => {
      let sectionChanged = false;
      const normalizedSection = { ...section };

      if (Array.isArray(section?.links)) {
        const normalizedLinks = section.links.map((link: any) => normalizeMenuNode(link));
        if (normalizedLinks.some((item) => item.changed)) {
          normalizedSection.links = normalizedLinks.map((item) => item.node);
          sectionChanged = true;
        }
      }

      return { node: normalizedSection, changed: sectionChanged };
    });

    if (nextSections.some((item) => item.changed)) {
      output.sections = nextSections.map((item) => item.node);
      changed = true;
    }
  }

  if (Array.isArray(output.videos)) {
    const nextVideos = output.videos.map((video: any) => normalizeMenuNode(video));
    if (nextVideos.some((item) => item.changed)) {
      output.videos = nextVideos.map((item) => item.node);
      changed = true;
    }
  }

  return { node: output, changed };
}

async function sanitizeHeaderSingletonData(strapi: Core.Strapi) {
  const headers = await strapi.documents(HEADER_UID as any).findMany({
    fields: ['documentId', 'locale'],
    populate: {
      menu: { populate: '*' },
      mobileMenu: { populate: '*' },
    },
    status: 'published',
  } as any);

  let updatedCount = 0;

  for (const entry of headers || []) {
    const normalizedMenu = Array.isArray(entry.menu)
      ? entry.menu.map((item: any) => normalizeMenuNode(item))
      : [];

    const normalizedMobileMenu = Array.isArray(entry.mobileMenu)
      ? entry.mobileMenu.map((item: any) => normalizeMenuNode(item))
      : [];

    const menuChanged = normalizedMenu.some((item: any) => item.changed);
    const mobileMenuChanged = normalizedMobileMenu.some((item: any) => item.changed);

    if (!menuChanged && !mobileMenuChanged) {
      continue;
    }

    await strapi.documents(HEADER_UID as any).update({
      documentId: entry.documentId,
      locale: entry.locale,
      status: 'published',
      data: {
        menu: normalizedMenu.map((item: any) => item.node),
        mobileMenu: normalizedMobileMenu.map((item: any) => item.node),
      },
    } as any);

    updatedCount += 1;
  }

  if (updatedCount > 0) {
    strapi.log.info(`Header sanitizer: normalized ${updatedCount} header locale entries.`);
  } else {
    strapi.log.info('Header sanitizer: no malformed header entries found.');
  }
}

async function verifyRecentReviewAvailability(strapi: Core.Strapi) {
  try {
    const recentReviewEntries = await strapi.documents('api::article.article' as any).findMany({
      fields: ['documentId'],
      filters: {
        isRecentReview: {
          $eq: true,
        },
      },
      pagination: {
        page: 1,
        pageSize: 1,
      },
      status: 'published',
    } as any);

    const hasRecentReview = Array.isArray(recentReviewEntries) && recentReviewEntries.length > 0;

    if (hasRecentReview) {
      strapi.log.info('Recent review verification: at least one published article has isRecentReview=true.');
      return;
    }

    strapi.log.warn('Recent review verification: no published article has isRecentReview=true. Recent Reviews section may appear empty.');
  } catch {
    strapi.log.warn('Recent review verification could not be completed.');
  }
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.customFields.register({
      name: 'tag-picker',
      type: 'string',
    });

    strapi.config.set('admin.preview', {
      enabled: true,
      config: {
        handler: async (uid, { documentId, locale, status }) => {
          const baseUrl = (process.env.PREVIEW_FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
          const secret = process.env.PREVIEW_SECRET || 'my-super-secret-preview-token';

          let resolvedSlug = '';

          try {
            if (uid && documentId) {
              const entry = await strapi.documents(uid).findOne({
                documentId,
                locale,
                status,
                fields: ['slug'],
              } as any);

              if (typeof entry?.slug === 'string' && entry.slug.trim()) {
                resolvedSlug = entry.slug.trim();
              }
            }
          } catch (error) {
            strapi.log.warn(`Preview slug resolve failed for ${uid}:${documentId}`);
          }

          const slugParam = encodeURIComponent(resolvedSlug || documentId || '');
          const localeParam = encodeURIComponent(locale || 'bn');
          const statusParam = encodeURIComponent(status || 'draft');
          const secretParam = encodeURIComponent(secret);

          return `${baseUrl}/api/preview?secret=${secretParam}&slug=${slugParam}&locale=${localeParam}&status=${statusParam}`;
        },
      },
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started. ghghgh
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const uploadSettingsStore = strapi.store({
      type: 'plugin',
      name: 'upload',
      key: 'settings',
    });

    const storedUploadSettings = await uploadSettingsStore.get({});
    const currentUploadSettings =
      storedUploadSettings && typeof storedUploadSettings === 'object' && !Array.isArray(storedUploadSettings)
        ? (storedUploadSettings as Record<string, unknown>)
        : {};
    const desiredUploadSettings = {
      ...currentUploadSettings,
      sizeOptimization: true,
      responsiveDimensions: true,
      autoOrientation: true,
      aiMetadata: false,
    };

    if (JSON.stringify(currentUploadSettings) !== JSON.stringify(desiredUploadSettings)) {
      await uploadSettingsStore.set({ value: desiredUploadSettings });
      strapi.log.info('Upload optimization defaults applied');
    }

    const commentsPluginEnabled = strapi.plugin('comments') !== undefined;

    if (commentsPluginEnabled) {
    strapi.db.lifecycles.subscribe({
      models: ['plugin::comments.comment'],
      async beforeUpdate(event) {
        const nextStatus = String(event?.params?.data?.approvalStatus || '').toUpperCase();
        if (nextStatus !== 'REJECTED') {
          return;
        }

        const existing = await strapi.db.query('plugin::comments.comment').findOne({
          where: event?.params?.where,
          select: ['id', 'approvalStatus', 'removed'],
        });

        const currentStatus = String(existing?.approvalStatus || '').toUpperCase();
        if (currentStatus !== 'APPROVED') {
          return;
        }

        // Do not mark as removed when rejecting - just update the status
        // event.params.data = {
        //   ...(event.params.data || {}),
        //   removed: true,
        // };

        event.state = {
          ...(event.state || {}),
          cascadeRemovedFromId: null, // Do not cascade remove children
        };
      },
      async afterUpdate(event) {
        const rootId = event?.state?.cascadeRemovedFromId;
        if (!rootId) {
          return;
        }

        const descendants = new Set();
        let frontier = [rootId];

        while (frontier.length > 0) {
          const children = await strapi.db.query('plugin::comments.comment').findMany({
            where: {
              threadOf: {
                id: {
                  $in: frontier,
                },
              },
              removed: { $not: true },
            },
            select: ['id'],
            limit: 1000,
          });

          const nextFrontier = [];
          for (const child of children || []) {
            if (!descendants.has(child.id)) {
              descendants.add(child.id);
              nextFrontier.push(child.id);
            }
          }

          frontier = nextFrontier;
        }

        if (descendants.size > 0) {
          await strapi.db.query('plugin::comments.comment').updateMany({
            where: {
              id: {
                $in: Array.from(descendants),
              },
            },
            data: {
              removed: true,
            },
          });
        }
      },
    });

    } // end if commentsPluginEnabled

    try {
      await sanitizeHeaderSingletonData(strapi);
    } catch (error) {
      strapi.log.warn('Header sanitizer failed to run cleanly.');
    }

    await verifyRecentReviewAvailability(strapi);

    const redisEnabled = ['true', '1', 'yes', 'on'].includes((process.env.REDIS_ENABLED || '').toLowerCase());

    if (redisEnabled) {
      const redisHost = process.env.REDIS_HOST || '127.0.0.1';
      const redisPort = process.env.REDIS_PORT || '6379';
      strapi.log.info(`Redis: enabled (${redisHost}:${redisPort})`);
      return;
    }

    strapi.log.info('Redis: disabled (set REDIS_ENABLED=true to enable)');

    // -------------------------------------------------------------------------
    // Auto-translate: bn-BD content → English locale on create/update
    // Covers: articles, categories, authors, and all i18n page types
    // Enable via GOOGLE_TRANSLATE_API_KEY + AUTO_TRANSLATE_ENABLED=true in .env
    // -------------------------------------------------------------------------
    if (isAutoTranslateEnabled()) {
      strapi.log.info('Auto-translate: enabled (Google Cloud Translation API)');

      // ── Articles ────────────────────────────────────────────────────────────
      strapi.db.lifecycles.subscribe({
        models: ['api::article.article'],
        async afterCreate(event) {
          const locale: string = event?.result?.locale || '';
          const publishedAt: string | null = event?.result?.publishedAt || null;
          if (locale !== 'bn-BD' || !publishedAt) return;
          await autoTranslateArticleToEnglish(strapi, event.result);
        },
        async afterUpdate(event) {
          const locale: string = event?.result?.locale || '';
          const publishedAt: string | null = event?.result?.publishedAt || null;
          if (locale !== 'bn-BD' || !publishedAt) return;
          await autoTranslateArticleToEnglish(strapi, event.result);
        },
      });

      // ── Categories ──────────────────────────────────────────────────────────
      strapi.db.lifecycles.subscribe({
        models: ['api::category.category'],
        async afterCreate(event) {
          if (event?.result?.locale !== 'bn-BD') return;
          await autoTranslateGeneric(strapi, 'api::category.category', event.result.documentId, 'bn-BD', {
            textFields: ['name', 'description'],
            slugSourceField: 'name',
          });
        },
        async afterUpdate(event) {
          if (event?.result?.locale !== 'bn-BD') return;
          await autoTranslateGeneric(strapi, 'api::category.category', event.result.documentId, 'bn-BD', {
            textFields: ['name', 'description'],
            slugSourceField: 'name',
          });
        },
      });

      // ── Authors ─────────────────────────────────────────────────────────────
      strapi.db.lifecycles.subscribe({
        models: ['api::author.author'],
        async afterCreate(event) {
          if (event?.result?.locale !== 'bn-BD') return;
          await autoTranslateGeneric(strapi, 'api::author.author', event.result.documentId, 'bn-BD', {
            textFields: ['name', 'display_name', 'bio'],
            slugSourceField: 'display_name',
            slugField: 'Slug',
          });
        },
        async afterUpdate(event) {
          if (event?.result?.locale !== 'bn-BD') return;
          await autoTranslateGeneric(strapi, 'api::author.author', event.result.documentId, 'bn-BD', {
            textFields: ['name', 'display_name', 'bio'],
            slugSourceField: 'display_name',
            slugField: 'Slug',
          });
        },
      });

      // ── About page ──────────────────────────────────────────────────────────
      strapi.db.lifecycles.subscribe({
        models: ['api::about.about'],
        async afterCreate(event) {
          if (event?.result?.locale !== 'bn-BD') return;
          await autoTranslateGeneric(strapi, 'api::about.about', event.result.documentId, 'bn-BD', {
            textFields: ['title', 'heroDescription', 'missionTitle', 'missionSubtitle', 'teamSectionTitle', 'historyTitle'],
          });
        },
        async afterUpdate(event) {
          if (event?.result?.locale !== 'bn-BD') return;
          await autoTranslateGeneric(strapi, 'api::about.about', event.result.documentId, 'bn-BD', {
            textFields: ['title', 'heroDescription', 'missionTitle', 'missionSubtitle', 'teamSectionTitle', 'historyTitle'],
          });
        },
      });

      // ── Privacy Policy page ─────────────────────────────────────────────────
      strapi.db.lifecycles.subscribe({
        models: ['api::privacy-policy.privacy-policy'],
        async afterCreate(event) {
          if (event?.result?.locale !== 'bn-BD') return;
          await autoTranslateGeneric(strapi, 'api::privacy-policy.privacy-policy', event.result.documentId, 'bn-BD', {
            textFields: ['title', 'heroDescription'],
            htmlFields: ['content'],
          });
        },
        async afterUpdate(event) {
          if (event?.result?.locale !== 'bn-BD') return;
          await autoTranslateGeneric(strapi, 'api::privacy-policy.privacy-policy', event.result.documentId, 'bn-BD', {
            textFields: ['title', 'heroDescription'],
            htmlFields: ['content'],
          });
        },
      });

      // ── Not Found page ──────────────────────────────────────────────────────
      strapi.db.lifecycles.subscribe({
        models: ['api::not-found.not-found'],
        async afterCreate(event) {
          if (event?.result?.locale !== 'bn-BD') return;
          await autoTranslateGeneric(strapi, 'api::not-found.not-found', event.result.documentId, 'bn-BD', {
            textFields: ['notFoundTitle', 'notFoundSubtitle', 'notFoundButtonLabel'],
          });
        },
        async afterUpdate(event) {
          if (event?.result?.locale !== 'bn-BD') return;
          await autoTranslateGeneric(strapi, 'api::not-found.not-found', event.result.documentId, 'bn-BD', {
            textFields: ['notFoundTitle', 'notFoundSubtitle', 'notFoundButtonLabel'],
          });
        },
      });

      // ── Global settings ─────────────────────────────────────────────────────
      strapi.db.lifecycles.subscribe({
        models: ['api::global.global'],
        async afterCreate(event) {
          if (event?.result?.locale !== 'bn-BD') return;
          await autoTranslateGeneric(strapi, 'api::global.global', event.result.documentId, 'bn-BD', {
            textFields: ['siteName', 'siteDescription'],
          });
        },
        async afterUpdate(event) {
          if (event?.result?.locale !== 'bn-BD') return;
          await autoTranslateGeneric(strapi, 'api::global.global', event.result.documentId, 'bn-BD', {
            textFields: ['siteName', 'siteDescription'],
          });
        },
      });

      // ── Footer ───────────────────────────────────────────────────────────────
      strapi.db.lifecycles.subscribe({
        models: ['api::footer.footer'],
        async afterCreate(event) {
          if (event?.result?.locale !== 'bn-BD') return;
          await autoTranslateGeneric(strapi, 'api::footer.footer', event.result.documentId, 'bn-BD', {
            textFields: [
              'description', 'newsletterText', 'appDescription',
              'newsletterPlaceholder', 'newsletterButtonText',
              'categoryTitle', 'recentPostTitle', 'copyrightText',
              'socialTitle', 'editorialName', 'editorialOffice',
              'editorialAddress1', 'editorialAddress2', 'editorialPhone',
              'editorialEmail', 'editorialEditor', 'editorialPublisher',
              'noMenuItemsText',
            ],
          });
        },
        async afterUpdate(event) {
          if (event?.result?.locale !== 'bn-BD') return;
          await autoTranslateGeneric(strapi, 'api::footer.footer', event.result.documentId, 'bn-BD', {
            textFields: [
              'description', 'newsletterText', 'appDescription',
              'newsletterPlaceholder', 'newsletterButtonText',
              'categoryTitle', 'recentPostTitle', 'copyrightText',
              'socialTitle', 'editorialName', 'editorialOffice',
              'editorialAddress1', 'editorialAddress2', 'editorialPhone',
              'editorialEmail', 'editorialEditor', 'editorialPublisher',
              'noMenuItemsText',
            ],
          });
        },
      });

    } else {
      strapi.log.info('Auto-translate: disabled (set GOOGLE_TRANSLATE_API_KEY + AUTO_TRANSLATE_ENABLED=true to enable)');
    }
  },
};

// ─── Generic auto-translate helper ───────────────────────────────────────────
// Fetches a document in bn-BD locale, translates the specified fields,
// then creates or updates the English locale version.
async function autoTranslateGeneric(
  strapi: Core.Strapi,
  uid: string,
  documentId: string,
  sourceLocale: string,
  options: {
    textFields?: string[];
    htmlFields?: string[];
    /** If set, a slug is generated from the translated value of this field */
    slugSourceField?: string;
    /** The name of the slug field in the schema (default: 'slug') */
    slugField?: string;
  },
) {
  if (!documentId) return;
  const { textFields = [], htmlFields = [], slugSourceField, slugField = 'slug' } = options;

  try {
    const full = await strapi.documents(uid as any).findOne({
      documentId,
      locale: sourceLocale,
    } as any);
    if (!full) return;

    const allFields: Record<string, string | undefined | null> = {};
    for (const f of [...textFields, ...htmlFields]) {
      allFields[f] = full[f] ?? null;
    }

    const translated = await translateFields(allFields, htmlFields);

    if (slugSourceField && translated[slugSourceField]) {
      translated[slugField] = slugify(translated[slugSourceField]);
    }

    const existing = await strapi.documents(uid as any).findOne({
      documentId,
      locale: 'en',
    } as any).catch(() => null);

    const payload: any = { documentId, locale: 'en', data: translated };

    if (existing) {
      await strapi.documents(uid as any).update(payload);
    } else {
      await strapi.documents(uid as any).create(payload);
    }

    const label = full[slugSourceField || textFields[0]] || documentId;
    strapi.log.info(`Auto-translate: ${existing ? 'updated' : 'created'} English locale for ${uid.split('::')[1]} "${label}"`);
  } catch (err: any) {
    strapi.log.error(`Auto-translate: failed for ${uid} ${documentId} — ${err?.message}`);
  }
}

// ─── Article-specific auto-translate ─────────────────────────────────────────
async function autoTranslateArticleToEnglish(strapi: Core.Strapi, bnArticle: any) {
  const documentId: string = bnArticle?.documentId;
  if (!documentId) return;

  try {
    // Fetch full article data (lifecycle event may have partial fields)
    const full = await strapi.documents('api::article.article' as any).findOne({
      documentId,
      locale: 'bn-BD',
      status: 'published',
      populate: { seo: true },
    } as any);

    if (!full) return;

    strapi.log.info(`Auto-translate: translating article "${full.title}" (${documentId}) to English…`);

    const translated = await translateArticle({
      title: full.title,
      excerpt: full.excerpt,
      content: full.content,
      seo: full.seo,
    });

    // Check if an English locale entry already exists
    const existing = await strapi.documents('api::article.article' as any).findOne({
      documentId,
      locale: 'en',
      status: 'published',
    } as any).catch(() => null);

    const payload = {
      documentId,
      locale: 'en',
      status: 'published',
      data: {
        ...translated,
        // Preserve non-translatable fields from the Bengali source
        cover: full.cover,
        category: full.category,
        author: full.author,
        videoUrl: full.videoUrl,
        isTopNews: full.isTopNews,
        isHeadline: full.isHeadline,
        isTopSlider: full.isTopSlider,
        isMiddleSlider: full.isMiddleSlider,
        isMostRead: full.isMostRead,
        isPopularNews: full.isPopularNews,
        isTechInnovation: full.isTechInnovation,
        isEditorsChoice: full.isEditorsChoice,
        isRecentPost: full.isRecentPost,
        isRecentReview: full.isRecentReview,
      },
    } as any;

    if (existing) {
      await strapi.documents('api::article.article' as any).update(payload);
      strapi.log.info(`Auto-translate: updated English locale for "${translated.title}"`);
    } else {
      await strapi.documents('api::article.article' as any).create(payload);
      strapi.log.info(`Auto-translate: created English locale for "${translated.title}"`);
    }
  } catch (err: any) {
    strapi.log.error(`Auto-translate: failed for article ${documentId} — ${err?.message}`);
  }
}
