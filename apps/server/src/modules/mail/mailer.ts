import { FactoryProvider } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { Config } from '../../config';

export const MAILER_SERVICE = Symbol('MAILER_SERVICE');

export type MailerService = Transporter<SMTPTransport.SentMessageInfo>;
export type MailerResponse = SMTPTransport.SentMessageInfo;

export const MAILER: FactoryProvider<
  Transporter<SMTPTransport.SentMessageInfo>
> = {
  provide: MAILER_SERVICE,
  useFactory: (config: Config) => {
    return createTransport({
      service: 'gmail',
      auth: {
        user: config.auth.email.login,
        pass: config.auth.email.password,
      },
    });
  },
  inject: [Config],
};
