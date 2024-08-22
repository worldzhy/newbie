import {Module} from '@nestjs/common';
import {TwilioService} from './twilio.service';

@Module({
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
