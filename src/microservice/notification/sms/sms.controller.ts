import {Body, Controller, Post} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {NotificationConfigurationService} from '../configuration/configuration.service';
import {SmsService} from './sms.service';

@ApiTags('[Microservice] Notification / Text Message')
@ApiBearerAuth()
@Controller('notification')
export class SmsController {
  private configuration = new NotificationConfigurationService();

  /**
   * Send SMS to one phone.
   * @param body
   * @returns
   */
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
  @Post('/text-message')
  async sendTextMessage(
    @Body()
    body: {
      phone: string;
      text: string;
    }
  ) {
    const configuration = await this.configuration.defaultConfiguration();
    const smsService = new SmsService(configuration!);

    const {phone, text} = body;
    return await smsService.sendOne({phone, text});
  }

  /**
   * Send SMS to many phones.
   * @param body
   * @returns
   */
  @ApiBody({
    description: "The request body should be {'phone', 'text'}.",
    examples: {
      a: {
        summary: '2. Send via SMS channel',
        value: {
          channel: 'sms',
          message: {
            phones: ['123456789', '234567891'],
            text: 'This is a test Pinpoint text message.',
          },
        },
      },
    },
  })
  @Post('/text-messages')
  async sendTextMessages(
    @Body()
    body: {
      phones: string[];
      text: string;
    }
  ) {
    const configuration = await this.configuration.defaultConfiguration();
    const smsService = new SmsService(configuration!);

    const {phones, text} = body;
    return await smsService.sendMany({phones, text});
  }
  /* End */
}
