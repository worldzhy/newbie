import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {render} from '@staart/mustache-markdown';
import {SES} from 'aws-sdk';
import {promises as fs} from 'fs';
import * as mem from 'mem';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SESTransport from 'nodemailer/lib/ses-transport';
import PQueue from 'p-queue';
import pRetry from 'p-retry';
import {join} from 'path';
import {MailOptions} from './mail.interface';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transport: Mail;
  private queue = new PQueue({concurrency: 1});
  private readTemplate = mem(this.readTemplateUnmemoized);

  constructor(private configService: ConfigService) {
    const config = this.configService.getOrThrow(
      'microservices.saas-starter.email'
    );

    if (config.ses?.accessKeyId)
      this.transport = nodemailer.createTransport({
        SES: new SES({
          apiVersion: '2010-12-01',
          accessKeyId: config.ses.accessKeyId,
          secretAccessKey: config.ses.secretAccessKey,
          region: config.ses.region,
        }),
      } as SESTransport.Options);
    else this.transport = nodemailer.createTransport(config.transport);
  }

  send(options: Mail.Options & MailOptions) {
    const config = this.configService.getOrThrow(
      'microservices.saas-starter.email'
    );

    this.queue
      .add(() =>
        pRetry(
          () =>
            this.sendMail({
              ...options,
              from: options.from ?? `"${config.name}" <${config.from}>`,
            }),
          {
            retries:
              this.configService.get<number>(
                'microservices.saas-starter.email.retries'
              ) ?? 3,
            onFailedAttempt: error => {
              this.logger.error(
                `Mail to ${options.to} failed, retrying (${error.retriesLeft} attempts left)`,
                error.name
              );
              console.log(error);
            },
          }
        )
      )
      .then(() => {})
      .catch(() => {});
  }

  private async sendMail(options: Mail.Options & MailOptions) {
    if (options.template) {
      const layout = await this.readTemplate('layout.html');
      let template = await this.readTemplate(options.template);
      let [markdown, html] = render(template, options.data);
      if (markdown.startsWith('#')) {
        const subject = markdown.split('\n', 1)[0].replace('#', '').trim();
        if (subject) {
          options.subject = options.subject ?? subject;
          markdown = markdown.replace(`# ${markdown.split('\n', 1)[0]}`, '');
        }
      }
      options.html = options.noLayout
        ? html
        : render(layout, {content: html})[1];
      options.text = markdown;
      options.alternatives = [
        {
          contentType: 'text/x-web-markdown',
          content: markdown,
        },
      ];
    }
    return this.transport.sendMail(options);
  }

  private async readTemplateUnmemoized(name: string) {
    if (!name.endsWith('.html')) name = `${name}.md`;
    return fs.readFile(join(__dirname, 'templates', name), 'utf8');
  }
}
