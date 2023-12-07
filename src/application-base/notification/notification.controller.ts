import {Controller, Post, Body} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {EmailNotification, SmsNotification} from '@prisma/client';
import {NotificationService} from '@microservices/notification/notification.service';

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiBody({
    description:
      "The request body should be {'subject', 'content', 'toAddress'}.",
    examples: {
      a: {
        summary: '1. Send via email channel',
        value: {
          email: 'email@example.com',
          subject: 'Example Email',
          plainText: 'This is a test Pinpoint email.',
        },
      },
    },
  })
  @Post('send-email')
  async sendEmail(
    @Body()
    body: {
      email: string;
      subject: string;
      plainText?: string;
      html?: string;
    }
  ): Promise<EmailNotification> {
    return await this.notificationService.sendEmail(body);
  }

  @ApiBody({
    description: "The request body should be {'phone', 'text'}.",
    examples: {
      a: {
        summary: '2. Send via SMS channel',
        value: {
          phone: '123456789',
          text: 'This is a test Pinpoint text message.',
        },
      },
    },
  })
  @Post('send-sms')
  async sendTextMessage(
    @Body()
    body: {
      phone: string;
      text: string;
    }
  ): Promise<SmsNotification> {
    return await this.notificationService.sendSms(body);
  }

  /* End */
}
