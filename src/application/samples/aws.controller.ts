import {Controller, Delete, Post, Body} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {S3Service} from '@toolkit/aws/aws.s3.service';
import {SqsService} from '@toolkit/aws/aws.sqs.service';

@ApiTags('Samples: AWS')
@ApiBearerAuth()
@Controller('aws')
export class AwsController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly sqsService: SqsService
  ) {}

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
  @Post('s3/create-bucket')
  async createS3Bucket(@Body() body: {bucketName: string}) {
    return await this.s3Service.createBucket(body.bucketName);
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
  @Delete('s3/delete-bucket')
  async deleteS3Bucket(@Body() body: {bucketName: string}) {
    return await this.s3Service.deleteBucket(body.bucketName);
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
  @Post('sqs/send-message')
  async sendSqsMessage(@Body() body: {queueUrl: string; payload: object}) {
    return await this.sqsService.sendMessage({
      queueUrl: body.queueUrl,
      body: body.payload,
    });
  }

  /* End */
}
