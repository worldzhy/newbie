import {Controller, Delete, Post, Body} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {S3Service} from './s3.service';
import {SnsService} from './sns.service';
import {SqsService} from './sqs.service';

@ApiTags('[Toolkit] AWS')
@ApiBearerAuth()
@Controller('aws')
export class AwsController {
  //* S3 create bucket.
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

  //* S3 delete bucket.
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

  //* SQS send message.
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
    return await sqsService.sendMessage({
      queueUrl: body.queueUrl,
      body: body.payload,
    });
  }

  //* SNS publish.
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

  /* End */
}
