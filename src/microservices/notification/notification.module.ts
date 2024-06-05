import {Global, Module} from '@nestjs/common';
import {SimpleEmailService} from './email/simple-email.service';
import {TraceableEmailService} from './email/traceable-email.service';
import {SmsService} from './sms/sms.service';
import {NotificationService} from './notification.service';
import {NotificationWebhookModule} from './webhook/webhook.module';

@Global()
@Module({
  imports: [NotificationWebhookModule],
  providers: [
    SimpleEmailService,
    TraceableEmailService,
    SmsService,
    NotificationService,
  ],
  exports: [
    SimpleEmailService,
    TraceableEmailService,
    SmsService,
    NotificationService,
  ],
})
export class NotificationModule {}
