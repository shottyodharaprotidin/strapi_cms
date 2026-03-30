'use strict';

/**
 * Seed English mobileMenu for the Header singleton
 * 
 * Run from the Strapi project root:
 *   npx strapi console
 *   > require('./scripts/seed-en-mobile-menu.js')()
 * 
 * Or with Node directly (after Strapi bootstrap):
 *   node -e "const strapi = require('@strapi/strapi'); strapi().load().then(() => require('./scripts/seed-en-mobile-menu.js')());"
 */

module.exports = async function seedEnMobileMenu() {
  const locale = 'en';

  // The English mobileMenu structure matching the Bangla one
  const mobileMenu = [
    { __component: 'navigation.base-link', title: 'Home', url: '/', openInNewTab: false },
    { __component: 'navigation.base-link', title: 'Special Report', url: '/special-report', openInNewTab: false },
    { __component: 'navigation.base-link', title: 'National', url: '/national', openInNewTab: false },
    { __component: 'navigation.base-link', title: 'Politics', url: '/politics', openInNewTab: false },
    { __component: 'navigation.base-link', title: 'Economy', url: '/economy', openInNewTab: false },
    { __component: 'navigation.base-link', title: 'Crime', url: '/crime', openInNewTab: false },
    { __component: 'navigation.base-link', title: 'Law & Court', url: '/law-and-court', openInNewTab: false },
    { __component: 'navigation.base-link', title: 'International', url: '/international', openInNewTab: false },
    { __component: 'navigation.base-link', title: 'Technology', url: '/technology', openInNewTab: false },
    { __component: 'navigation.base-link', title: 'Sports', url: '/sports', openInNewTab: false },
    { __component: 'navigation.base-link', title: 'Entertainment', url: '/entertainment', openInNewTab: false },
    {
      __component: 'navigation.dropdown-menu',
      title: 'More',
      subMenus: [
        {
          __component: 'navigation.nested-dropdown',
          title: 'National',
          subMenus: [
            { title: 'Dhaka', url: '#', openInNewTab: false },
            { title: 'Chittagong', url: '#', openInNewTab: false },
            { title: 'Rajshahi', url: '#', openInNewTab: false },
            { title: 'Khulna', url: '#', openInNewTab: false },
          ],
        },
        {
          __component: 'navigation.nested-dropdown',
          title: 'Politics',
          subMenus: [
            { title: 'BNP', url: '#', openInNewTab: false },
            { title: 'NCP', url: '#', openInNewTab: false },
            { title: 'Jamaat-e-Islami', url: '#', openInNewTab: false },
            { title: 'Election', url: '#', openInNewTab: false },
            { title: 'Parliament', url: '#', openInNewTab: false },
          ],
        },
        {
          __component: 'navigation.nested-dropdown',
          title: 'International',
          subMenus: [
            { title: 'Asia', url: '#', openInNewTab: false },
            { title: 'Europe', url: '#', openInNewTab: false },
            { title: 'Middle East', url: '#', openInNewTab: false },
          ],
        },
        {
          __component: 'navigation.nested-dropdown',
          title: 'Economy',
          subMenus: [
            { title: 'Banking', url: '#', openInNewTab: false },
            { title: 'Stock Market', url: '#', openInNewTab: false },
            { title: 'Business', url: '#', openInNewTab: false },
          ],
        },
      ],
    },
  ];

  try {
    // Find the existing English header entry
    const existing = await strapi.documents('api::header.header').findFirst({ locale });

    if (!existing) {
      console.log('No English header entry found. Creating one...');
      await strapi.documents('api::header.header').create({
        locale,
        data: { mobileMenu },
        status: 'published',
      });
      console.log('English header with mobileMenu created successfully!');
    } else {
      console.log(`Found English header (id: ${existing.id}). Updating mobileMenu...`);
      await strapi.documents('api::header.header').update({
        documentId: existing.documentId,
        locale,
        data: { mobileMenu },
        status: 'published',
      });
      console.log('English mobileMenu updated successfully!');
    }

    // Verify
    const updated = await strapi.documents('api::header.header').findFirst({
      locale,
      populate: { mobileMenu: true },
    });
    console.log(`Verification: mobileMenu now has ${updated?.mobileMenu?.length || 0} items`);
  } catch (error) {
    console.error('Error seeding English mobileMenu:', error);
  }
};
