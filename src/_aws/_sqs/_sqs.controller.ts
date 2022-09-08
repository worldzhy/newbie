import {Body, Controller, Post} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {SqsService} from './_sqs.service';

@ApiTags('_AWS')
@ApiBearerAuth()
@Controller()
export class SqsController {
  private sqsService = new SqsService();

  @ApiBody({
    examples: {
      a: {
        summary: '1. Send message with SMS body',
        value: {
          queueUrl: 'example-queue-url',
          messageBody: {
            content: 'This is a test message.',
            phone: '123456789',
          },
        },
      },
    },
    description:
      "The request body should contain 'queueUrl' and 'messageBody' attributes.",
  })
  @Post('/aws/sqs/send-message')
  async createBucket(@Body() body: {queueUrl: string; messageBody: object}) {
    return await this.sqsService.sendMessage(body.queueUrl, body.messageBody);
  }

  /* End */
}
