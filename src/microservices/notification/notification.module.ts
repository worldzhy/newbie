import {Module} from '@nestjs/common';
import {EmailNotificationService} from './email/email.service';
import {SmsNotificationService} from './sms/sms.service';
import {EmailNotificationController} from './email/email.controller';
import {SmsNotificationController} from './sms/sms.controller';

@Module({
  controllers: [EmailNotificationController, SmsNotificationController],
  providers: [EmailNotificationService, SmsNotificationService],
  exports: [EmailNotificationService, SmsNotificationService],
})
export class NotificationModule {}
