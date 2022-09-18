import {Controller, Post, Body} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {EmailNotification} from '@prisma/client';
import {EmailNotificationService} from './email.service';

@ApiTags('[Microservice] Notification')
@ApiBearerAuth()
@Controller('notification')
export class EmailNotificationController {
  private emailNotificationService = new EmailNotificationService();

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
  @Post('email')
  async sendEmail(
    @Body()
    body: {
      email: string;
      subject: string;
      plainText?: string;
      html?: string;
    }
  ): Promise<EmailNotification> {
    return await this.emailNotificationService.sendEmail(body);
  }

  /* End */
}
