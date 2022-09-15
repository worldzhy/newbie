import {Body, Controller, Delete, Post} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {PinpointService} from './_pinpoint.service';
import {S3Service} from './_s3.service';
import {SnsService} from './_sns.service';
import {SqsService} from './_sqs.service';

@ApiTags('[Utility] AWS')
@ApiBearerAuth()
@Controller('aws')
export class AwsController {
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
  @Post('s3/bucket')
  async createS3Bucket(@Body() body: {bucketName: string}) {
    const s3Service = new S3Service();
    return await s3Service.createBucket(body.bucketName);
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
  @Delete('s3/bucket')
  async deleteS3Bucket(@Body() body: {bucketName: string}) {
    const s3Service = new S3Service();
    return await s3Service.deleteBucket(body.bucketName);
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
          queueUrl: 'https://aws.sqs.queue',
          payload: {
            content: 'This is a test message.',
            phone: '123456789',
          },
        },
      },
    },
  })
  @Post('sqs/message')
  async sendSqsMessage(@Body() body: {queueUrl: string; payload: object}) {
    const sqsService = new SqsService();
    return await sqsService.sendMessage(body.queueUrl, body.payload);
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
          phone: '123456789',
          message: 'This is a test notification message.',
        },
      },
    },
    description: "The request body should contain 'bucketName' attribute.",
  })
  @Post('sns/publish')
  async sendSnsMessage(@Body() body: {phone: string; message: string}) {
    const snsService = new SnsService();
    return await snsService.publish({
      PhoneNumber: body.phone,
      Message: body.message,
    });
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
          config: {
            pinpointApplicationId: 'aljflajsfa',
            pinpointFromAddress: 'henry@inceptionpad.com',
          },
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
  @Post('pinpoint/email')
  async sendPinpointEmail(
    @Body()
    body: {
      email: string;
      subject: string;
      plainText?: string;
      html?: string;
    }
  ) {
    const pinpointService = new PinpointService();
    const params = pinpointService.buildSendMessagesParams_Email({
      emails: [body.email],
      subject: body.subject,
      plainText: body.plainText,
      html: body.html,
    });

    return await pinpointService.sendMessages(params);
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
          phone: '123456789',
          text: 'This is a test Pinpoint text message.',
        },
      },
    },
    description:
      "The request body should be {'subject', 'content', 'toAddress'} or {'content', 'phone'}.",
  })
  @Post('pinpoint/text-message')
  async sendPinpointTextMessage(
    @Body()
    body: {
      phone: string;
      text: string;
    }
  ) {
    const pinpointService = new PinpointService();
    const params = pinpointService.buildSendMessagesParams_Sms({
      phones: [body.phone],
      text: body.text,
    });

    return await pinpointService.sendMessages(params);
  }
  /* End */
}
