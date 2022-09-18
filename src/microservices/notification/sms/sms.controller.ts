import {Controller, Post, Body} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {SmsNotification} from '@prisma/client';
import {SmsNotificationService} from './sms.service';

@ApiTags('[Microservice] Notification')
@ApiBearerAuth()
@Controller('notification')
export class SmsNotificationController {
  private smsNotificationService = new SmsNotificationService();

  @ApiBody({
    description: "The request body should be {'phone', 'text'}.",
    examples: {
      a: {
        summary: '2. Send via SMS channel',
        value: {
          channel: 'sms',
          message: {
            phone: '123456789',
            text: 'This is a test Pinpoint text message.',
          },
        },
      },
    },
  })
  @Post('text-message')
  async sendTextMessage(
    @Body()
    body: {
      phone: string;
      text: string;
    }
  ): Promise<SmsNotification> {
    return await this.smsNotificationService.sendTextMessage(body);
  }

  /* End */
}
