'use strict';

/**
 * Custom Amazon SES email provider for Strapi v5.
 * Uses @aws-sdk/client-ses (AWS SDK v3) directly — no node-ses / request dependency.
 *
 * providerOptions accepted:
 *   key     – AWS access key ID
 *   secret  – AWS secret access key
 *   region  – SES region (e.g. 'ap-southeast-1')
 */

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

module.exports = {
  init({ key, secret, region = 'ap-southeast-1', defaultFrom, defaultReplyTo }) {
    const client = new SESClient({
      region,
      credentials: {
        accessKeyId: key,
        secretAccessKey: secret,
      },
    });

    return {
      async send({ from, to, cc, bcc, replyTo, subject, text, html }) {
        const source = from || defaultFrom;
        const replyToAddresses = replyTo || defaultReplyTo;
        const toAddresses = Array.isArray(to) ? to : [to];

        if (!source) {
          throw new Error('SES provider missing sender email. Set AWS_SES_DEFAULT_FROM or pass from in send().');
        }

        const params = {
          Source: source,
          Destination: {
            ToAddresses: toAddresses,
            ...(cc ? { CcAddresses: Array.isArray(cc) ? cc : [cc] } : {}),
            ...(bcc ? { BccAddresses: Array.isArray(bcc) ? bcc : [bcc] } : {}),
          },
          Message: {
            Subject: { Charset: 'UTF-8', Data: subject },
            Body: {
              ...(html ? { Html: { Charset: 'UTF-8', Data: html } } : {}),
              ...(text ? { Text: { Charset: 'UTF-8', Data: text } } : {}),
            },
          },
          ...(replyToAddresses
            ? { ReplyToAddresses: Array.isArray(replyToAddresses) ? replyToAddresses : [replyToAddresses] }
            : {}),
        };

        return client.send(new SendEmailCommand(params));
      },
    };
  },
};
