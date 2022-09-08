import {Body, Controller, Post} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {S3Service} from './_s3.service';

@ApiTags('_AWS')
@ApiBearerAuth()
@Controller()
export class S3Controller {
  private s3Service = new S3Service();

  @ApiBody({
    examples: {
      a: {
        summary: '1. Correct bucket name format',
        value: {
          bucketName: 'example-bucket-name',
        },
      },
    },
    description: "The request body should contain 'bucketName' attribute.",
  })
  @Post('/aws/s3/create-bucket')
  async createBucket(@Body() body: {bucketName: string}) {
    return await this.s3Service.createBucket(body.bucketName);
  }

  @ApiBody({
    examples: {
      a: {
        summary: '1. Correct bucket name format',
        value: {
          bucketName: 'example-bucket-name',
        },
      },
    },
    description: "The request body should contain 'bucketName' attribute.",
  })
  @Post('/aws/s3/delete-bucket')
  async deleteBucket(@Body() body: {bucketName: string}) {
    return await this.s3Service.deleteBucket(body.bucketName);
  }

  /* End */
}
