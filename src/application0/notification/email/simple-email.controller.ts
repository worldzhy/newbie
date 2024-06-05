import {SimpleEmailService} from '@microservices/notification/email/simple-email.service';
import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';

@ApiTags('Notification / Email')
@ApiBearerAuth()
@Controller('notification')
export class SimpleEmailController {
  constructor(private readonly simpleEmailService: SimpleEmailService) {}

  @Post('simple-email')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          toAddress: 'henry@inceptionpad.com',
          subject: 'A strange letter',
          content: 'No. 142857',
        },
      },
    },
  })
  async sendSimpleEmail(
    @Body()
    body: {
      email: string;
      subject: string;
      plainText?: string;
      html?: string;
    }
  ) {
    return await this.simpleEmailService.send(body);
  }

  /* End */
}
