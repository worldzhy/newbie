import {Body, Controller, Post} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {SnsService} from './_sns.service';

@ApiTags('AWS')
@ApiBearerAuth()
@Controller()
export class SnsController {
  private snsService = new SnsService();

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
  @Post('/aws/sns/publish')
  async createBucket(@Body() body: {PhoneNumber: string; Message: string}) {
    const {PhoneNumber, Message} = body;
    return await this.snsService.publish({PhoneNumber, Message});
  }

  /* End */
}
