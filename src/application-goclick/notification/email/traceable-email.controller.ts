import {TraceableEmailService} from '@microservices/notification/email/traceable-email.service';
import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';

@ApiTags('Notification / Email')
@ApiBearerAuth()
@Controller('notification')
export class TraceableEmailController {
  constructor(private readonly traceableEmailService: TraceableEmailService) {}

  @Post('traceable-email')
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
  async sendTraceableEmail(
    @Body() body: {toAddress: string; subject: string; content: string}
  ) {
    return await this.traceableEmailService.send(body);
  }

  /* End */
}
