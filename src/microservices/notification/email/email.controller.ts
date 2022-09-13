import {Body, Controller, Post} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {EmailService} from './email.service';

@ApiTags('[Microservice] Notification / Email')
@ApiBearerAuth()
@Controller('notification')
export class EmailController {
  private emailService = new EmailService();

  /**
   * Send to one email.
   * @param body
   */
  @ApiBody({
    description:
      "The request body should be {'subject', 'content', 'toAddress'}.",
    examples: {
      a: {
        summary: '1. Send via email channel',
        value: {
          channel: 'email',
          message: {
            email: 'email@example.com',
            subject: 'Example Email',
            plainText: 'This is a test Pinpoint email.',
          },
        },
      },
    },
  })
  @Post('/email')
  async sendEmail(
    @Body()
    body: {
      email: string;
      subject: string;
      plainText?: string;
      html?: string;
    }
  ) {
    const {email, subject, plainText, html} = body;
    await this.emailService.sendOne({email, subject, plainText, html});
  }

  /**
   * Send to many emails.
   * @param body
   */
  @ApiBody({
    description:
      "The request body should be {'subject', 'content', 'toAddress'}.",
    examples: {
      a: {
        summary: '1. Send via email channel',
        value: {
          channel: 'email',
          message: {
            emails: ['email1@example.com', 'email2@example.com'],
            subject: 'Example Email',
            plainText: 'This is a test Pinpoint email.',
          },
        },
      },
    },
  })
  @Post('/emails')
  async sendEmails(
    @Body()
    body: {
      emails: string[];
      subject: string;
      plainText?: string;
      html?: string;
    }
  ) {
    const {emails, subject, plainText, html} = body;
    await this.emailService.sendMany({emails, subject, plainText, html});
  }

  /* End */
}
