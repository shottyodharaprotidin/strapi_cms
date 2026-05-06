const config = {
  auth: {
    logo: undefined,
  },
  head: {
    favicon: undefined,
    title: 'সত্যধারা প্রতিদিন',
  },
  menu: {
    logo: undefined,
  },
  locales: ['bn'],
  translations: {
    en: {
      'Auth.form.welcome.title': 'Welcome to Admin Portal',
      'Auth.form.welcome.subtitle': 'Log in to your Account',
      'app.components.LeftMenu.navbrand.title': 'সত্যধারা প্রতিদিন',
    },
  },
  tutorials: false,
  notifications: {
    releases: false,
  },
};

export default {
  config,
  register(app) {
    app.customFields.register({
      name: 'tag-picker',
      type: 'string',
      intlLabel: {
        id: 'global.tag-picker.label',
        defaultMessage: 'Tags',
      },
      intlDescription: {
        id: 'global.tag-picker.description',
        defaultMessage: 'Search existing tags or create new ones by typing',
      },
      components: {
        Input: async () => import('./extensions/TagPickerInput'),
      },
    });
  },
  bootstrap() {
    if (typeof document === 'undefined') {
      return;
    }

    const desiredTitle = 'সত্যধারা প্রতিদিন';
    const applyTitle = () => {
      if (document.title !== desiredTitle) {
        document.title = desiredTitle;
      }
    };

    applyTitle();

    const titleEl = document.querySelector('title');
    if (titleEl && typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(applyTitle);
      observer.observe(titleEl, { childList: true, subtree: true });
    }
  },
};
