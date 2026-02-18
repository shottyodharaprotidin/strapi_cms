/**
 * Admin app customization
 * This file is loaded by Strapi to customize the admin panel
 */

export default {
  config: {
    translation: {
      en: {
        'app.containers.AuthPage.Head.title': 'Welcome to Admin Portal',
        'app.containers.AuthPage.Head.description': 'Log in to your Account',
      },
    },
  },
  bootstrap(app) {
    // Customize admin panel on load
  },
};
