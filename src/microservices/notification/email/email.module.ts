import {Global, Module} from '@nestjs/common';
import {EmailService} from './email.service';
import {AwsPinpointService} from './aws.pinpoint.service';

@Global()
@Module({
  providers: [EmailService, AwsPinpointService],
  exports: [EmailService],
})
export class EmailModule {}
