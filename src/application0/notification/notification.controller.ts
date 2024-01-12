import {Notification2Service} from '@microservices/notification/notification2.service';
import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(private readonly notification2Service: Notification2Service) {}

  @Post('traceable-email')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          queueUrl:
            'https://sqs.us-east-1.amazonaws.com/196438055748/inceptionpad-message-service-email-queue-level1',
          body: {
            toAddress: 'henry@inceptionpad.com',
            subject: 'A strange letter',
            content: 'No. 142857',
          },
        },
      },
    },
  })
  async sendTraceableEmail(
    @Body()
    body: {
      queueUrl: string;
      body: {toAddress: string; subject: string; content: string};
    }
  ) {
    return await this.notification2Service.sendEmail(body);
  }

  /* End */
}
