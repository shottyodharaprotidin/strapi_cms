'use strict';

/**
 * `admin-text-override` middleware
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    await next();

    // Replace admin login text
    if (ctx.url === '/admin' && typeof ctx.body === 'string') {
      ctx.body = ctx.body
        .replace(/Welcome to Strapi!/g, 'Welcome to Admin Portal')
        .replace(/Log in to your Strapi account/g, 'Log in to your Account');
    }
  };
};
