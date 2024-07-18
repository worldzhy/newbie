import {Global, Module} from '@nestjs/common';
import {SmsService} from './sms.service';
import {AwsPinpointService} from './aws.pinpoint.service';

@Global()
@Module({
  providers: [SmsService, AwsPinpointService],
  exports: [SmsService],
})
export class SmsModule {}
