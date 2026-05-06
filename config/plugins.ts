import path from 'path';

export default ({ env }) => {
  // Local lite mode keeps admin startup fast on Windows by skipping heavy plugins.
  const localLiteMode = env.bool('LOCAL_LITE_MODE', false);

  return ({
  ckeditor5: {
    enabled: true,
  },
  i18n: {
    enabled: true,
    config: {
      defaultLocale: 'bn-BD',
    },
  },
  upload: {
    breakpoints: {
      xlarge: 1600,
      large: 1200,
      medium: 800,
      small: 500,
      xsmall: 320,
    },
    config: {
      provider: 'local',
      sizeLimit: 1024 * 1024 * 1024, // 1GB (Super high limit to simulate no limit)
      providerOptions: {
        // using Strapi's built-in local provider (uploads go to /public/uploads)
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
      // Disable AI metadata (requires Strapi Cloud license — causes 500 on upload without one)
      settings: {
        aiMetadata: false,
      },
    },
  },
  comments: {
    enabled: !localLiteMode,
    config: {
      badWords: false,
      moderatorRoles: ['Authenticated'],
      approvalFlow: ['api::article.article'],
      entryLabel: {
        '*': ['title', 'slug'],
      },
      enabledCollections: ['api::article.article'],
    },
  },
  // Email plugin with AWS SES — uses local provider (AWS SDK v3, no node-ses)
  // Local SMTP takes precedence when SMTP_HOST is set.
  // Otherwise, fallback to AWS SES when AWS credentials are present.
  ...(env('SMTP_HOST') ? {
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: env('SMTP_HOST'),
          port: env.int('SMTP_PORT', 587),
          secure: env.bool('SMTP_SECURE', false),
          auth: {
            user: env('SMTP_USER'),
            pass: env('SMTP_PASS'),
          },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 10000,
        },
        settings: {
          defaultFrom: env('SMTP_FROM', 'noreply@shottyodharaprotidin.com'),
          defaultReplyTo: env('SMTP_REPLY_TO', env('SMTP_FROM', 'noreply@shottyodharaprotidin.com')),
        },
      },
    },
  } : env('AWS_SES_ACCESS_KEY_ID') ? {
    email: {
      config: {
        provider: path.resolve(process.cwd(), 'src/extensions/email-ses'),
        providerOptions: {
          key: env('AWS_SES_ACCESS_KEY_ID'),
          secret: env('AWS_SES_SECRET_ACCESS_KEY'),
          region: env('AWS_SES_REGION', 'ap-southeast-1'),
          defaultFrom: env('AWS_SES_DEFAULT_FROM', 'noreply@shottyodharaprotidin.com'),
          defaultReplyTo: env('AWS_SES_DEFAULT_REPLY_TO', env('AWS_SES_DEFAULT_FROM', 'noreply@shottyodharaprotidin.com')),
        },
        settings: {
          defaultFrom: env('AWS_SES_DEFAULT_FROM', 'noreply@shottyodharaprotidin.com'),
          defaultReplyTo: env('AWS_SES_DEFAULT_REPLY_TO', 'noreply@shottyodharaprotidin.com'),
        },
      },
    },
  } : {}),
  seo: {
    enabled: true,
  },
  publisher: {
    enabled: !localLiteMode && !!env('DATABASE_HOST'), // only in production (postgres)
  },
  // Redis is enabled automatically when REDIS_HOST is set in .env (i.e. in production)
  redis: {
    enabled: !!env('REDIS_HOST'),
    config: {
      connections: {
        default: {
          connection: {
            host: env('REDIS_HOST', '127.0.0.1'),
            port: env.int('REDIS_PORT', 6379),
            db: env.int('REDIS_DB', 0),
            ...(env('REDIS_PASSWORD') ? { password: env('REDIS_PASSWORD') } : {}),
          },
        },
      },
    },
  },
  'webp-converter': {
    enabled: false, // Disabled due to Windows PNG upload crash issues
  },
  });
};
