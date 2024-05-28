import {Global, Module} from '@nestjs/common';
import {SimpleEmailService} from './email/simple-email.service';
import {TraceableEmailService} from './email/traceable-email.service';
import {SmsService} from './sms/sms.service';
import {NotificationWebhookModule} from './webhook/webhook.module';

@Global()
@Module({
  imports: [NotificationWebhookModule],
  providers: [SimpleEmailService, TraceableEmailService, SmsService],
  exports: [SimpleEmailService, TraceableEmailService, SmsService],
})
export class NotificationModule {}
