const config = {
  auth: {
    logo: undefined,
  },
  head: {
    favicon: undefined,
    title: undefined,
  },
  menu: {
    logo: undefined,
  },
  translations: {
    en: {
      'Auth.form.welcome.title': 'Welcome to Admin Portal',
      'Auth.form.welcome.subtitle': 'Log in to your Account',
    },
  },
  theme: {
    colors: {
      primary100: '#f0f4ff',
      primary200: '#d9e8ff',
      primary500: '#004eeb',
      primary600: '#004ce0',
      primary700: '#0040c4',
      danger700: '#b72b1a',
    },
  },
  tutorials: false,
  notifications: {
    releases: false,
  },
};

const bootstrap = (app) => {};

export default {
  config,
  bootstrap,
};
