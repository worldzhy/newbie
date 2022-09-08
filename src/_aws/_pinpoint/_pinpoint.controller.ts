import {Body, Controller, Post} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {PinpointService} from './_pinpoint.service';
import {AwsEnum} from '../../_config/_common.enum';

@ApiTags('_AWS')
@ApiBearerAuth()
@Controller()
export class PinpointController {
  private pinpointService = new PinpointService();

  @ApiBody({
    examples: {
      a: {
        summary: '1. Send via email channel',
        value: {
          channel: 'email',
          message: {
            subject: 'Example Email',
            content: 'This is a test Pinpoint email.',
            toAddress: 'email@example.com',
          },
        },
      },
      b: {
        summary: '2. Send via SMS channel',
        value: {
          channel: 'sms',
          message: {
            content: 'This is a test Pinpoint text message.',
            phone: '123456789',
          },
        },
      },
    },
    description:
      "The request body should be {'subject', 'content', 'toAddress'} or {'content', 'phone'}.",
  })
  @Post('/aws/pinpoint/send-message')
  async sendMessage(
    @Body()
    body: {
      channel: string;
      message: {
        subject?: string;
        content: string;
        toAddress?: string;
        phone?: string;
      };
    }
  ) {
    let params;
    const {subject, content, toAddress, phone} = body.message;

    if (body.channel === AwsEnum.pinpointChannel.EMAIL) {
      params = this.pinpointService.generateEmailMessageParams({
        subject,
        content,
        toAddress,
      });
    } else if (body.channel === AwsEnum.pinpointChannel.SMS) {
      params = this.pinpointService.generateSmsMessageParams({
        content,
        phone,
      });
    }

    return await this.pinpointService.sendMessages(params);
  }

  /* End */
}
