import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {MtracService} from './mtrac.service';

@ApiTags('App / Message Tracker')
@ApiBearerAuth()
@Controller('mtrac')
export class MtracController {
  constructor(private mtracService: MtracService) {}

  /**
   * Send email message to SQS
   * @param body
   * @returns
   */
  @Post('/send-email')
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
  ): Promise<{data: object | null; err: object | null}> {
    const {subject, content, toAddress} = body;
    const result = await this.mtracService.sendEmail(
      subject,
      content,
      toAddress
    );
    return {
      data: result.data,
      err: result.err,
    };
  }

  /**
   * Send sms message to SQS
   * @param body
   * @returns
   */
  @Post('/send-sms')
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
  ): Promise<{data: {message: string} | null; err: null}> {
    const {content, phone} = body;
    const result = await this.mtracService.sendSms(content, phone);
    return {
      data: result.data,
      err: null,
    };
  }

  /* End */
}
