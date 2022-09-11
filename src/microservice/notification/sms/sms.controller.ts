import {Body, Controller, Post} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {SmsService} from './sms.service';

@ApiTags('[Microservice] Notification / Text Message')
@ApiBearerAuth()
@Controller('notification')
export class SmsController {
  private smsService = new SmsService();

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
  async sendSms(
    @Body()
    body: {
      phone: string;
      text: string;
    }
  ) {
    const {phone, text} = body;

    return await this.smsService.sendOne({phone, text});
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
  async sendSmses(
    @Body()
    body: {
      phones: string[];
      text: string;
    }
  ) {
    const {phones, text} = body;

    return await this.smsService.sendMany({phones, text});
  }
  /* End */
}
