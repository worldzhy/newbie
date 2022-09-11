import {Body, Controller, Post} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {PinpointService} from './_pinpoint.service';
import {S3Service} from './_s3.service';
import {SnsService} from './_sns.service';
import {SqsService} from './_sqs.service';

@ApiTags('[Base] AWS')
@ApiBearerAuth()
@Controller('aws')
export class AwsController {
  private s3Service = new S3Service();
  private sqsService = new SqsService();
  private snsService = new SnsService();
  private pinpointService = new PinpointService();

  /**
   * S3 create bucket.
   * @param body
   * @returns
   */
  @ApiBody({
    description: "The request body should contain 'bucketName' attribute.",
    examples: {
      a: {
        summary: '1. Correct bucket name format',
        value: {
          bucketName: 'example-bucket-name',
        },
      },
    },
  })
  @Post('/s3/create-bucket')
  async createBucket(@Body() body: {bucketName: string}) {
    return await this.s3Service.createBucket(body.bucketName);
  }

  /**
   * S3 delete bucket.
   * @param body
   * @returns
   */
  @ApiBody({
    description: "The request body should contain 'bucketName' attribute.",
    examples: {
      a: {
        summary: '1. Correct bucket name format',
        value: {
          bucketName: 'example-bucket-name',
        },
      },
    },
  })
  @Post('/s3/delete-bucket')
  async deleteBucket(@Body() body: {bucketName: string}) {
    return await this.s3Service.deleteBucket(body.bucketName);
  }

  /**
   * SQS send message.
   * @param body
   * @returns
   */
  @ApiBody({
    description: '',
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
  })
  @Post('/sqs/send-message')
  async sendSqsMessage(@Body() body: {queueUrl: string; messageBody: object}) {
    return await this.sqsService.sendMessage(body.queueUrl, body.messageBody);
  }

  /**
   * SNS publish.
   * @param body
   * @returns
   */
  @ApiBody({
    examples: {
      a: {
        summary: '1. Incorrect phone',
        value: {
          PhoneNumber: '123456789',
          Message: 'This is a test notification message.',
        },
      },
    },
    description: "The request body should contain 'bucketName' attribute.",
  })
  @Post('/sns/publish')
  async sendSnsMessage(@Body() body: {PhoneNumber: string; Message: string}) {
    const {PhoneNumber, Message} = body;
    return await this.snsService.publish({PhoneNumber, Message});
  }

  /**
   * Pinpoint send email message.
   * @param body
   * @returns
   */
  @ApiBody({
    examples: {
      a: {
        summary: '1. Send via email channel',
        value: {
          email: 'email@example.com',
          subject: 'Example Email',
          plainText: 'This is a test Pinpoint email.',
          html: 'This is a test Pinpoint email.',
        },
      },
    },
    description:
      "The request body should be {'subject', 'content', 'toAddress'} or {'content', 'phone'}.",
  })
  @Post('/pinpoint/send-email')
  async sendEmailMessage(
    @Body()
    body: {
      channel: string;
      message: {
        email: string;
        subject: string;
        plainText?: string;
        html?: string;
      };
    }
  ) {
    const {email, subject, plainText, html} = body.message;
    const params = this.pinpointService.buildSendMessagesParams_Email({
      emails: [email],
      subject,
      plainText,
      html,
    });

    return await this.pinpointService.sendMessages(params);
  }

  /**
   * Pinpoint send SMS message.
   * @param body
   * @returns
   */
  @ApiBody({
    examples: {
      a: {
        summary: '1. Send via SMS channel',
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
  @Post('/pinpoint/send-sms')
  async sendSmsMessage(
    @Body()
    body: {
      phone: string;
      text: string;
    }
  ) {
    const {phone, text} = body;
    const params = this.pinpointService.buildSendMessagesParams_Sms({
      phones: [phone],
      text,
    });

    return await this.pinpointService.sendMessages(params);
  }
  /* End */
}
