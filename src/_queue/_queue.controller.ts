import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {QueueService} from './_queue.service';

@ApiTags('Queue')
@ApiBearerAuth()
@Controller()
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Post('queue/email-message')
  @ApiBody({
    description:
      "The 'subject', 'content' and 'toAddress' are required in request body.",
    examples: {
      a: {
        summary: '1. Correct example',
        value: {
          subject: 'Example Subject',
          content: 'This is an example email',
          toAddress: 'email@example.com',
        },
      },
    },
  })
  async sendEmail(
    @Body()
    body: {
      subject: string;
      content: string;
      toAddress: string;
    }
  ) {
    const {subject, content, toAddress} = body;
    const result = await this.queueService.sendEmail(
      subject,
      content,
      toAddress
    );
    return {
      data: result.data,
      err: result.err,
    };
  }

  @Post('queue/sms-message')
  @ApiBody({
    description: "The 'content' and 'phone' are required in request body.",
    examples: {
      a: {
        summary: '1. Correct example',
        value: {
          content: 'This is an example SMS',
          phone: '13960068008',
        },
      },
    },
  })
  async sendSms(
    @Body()
    body: {
      content: string;
      phone: string;
    }
  ) {
    const {content, phone} = body;
    const result = await this.queueService.sendSms(content, phone);
    return {
      data: result.data,
      err: null,
    };
  }

  /* End */
}
