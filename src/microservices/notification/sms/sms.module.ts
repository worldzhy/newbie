import {Module} from '@nestjs/common';
import {SmsNotificationController} from './sms.controller';
import {SmsNotificationService} from './sms.service';

@Module({
  controllers: [SmsNotificationController],
  providers: [SmsNotificationService],
  exports: [SmsNotificationService],
})
export class SmsModule {}
