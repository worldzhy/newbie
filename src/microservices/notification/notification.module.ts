import {Global, Module} from '@nestjs/common';
import {EmailModule} from './email/email.module';
import {SmsModule} from './sms/sms.module';
import {TraceableEmailModule} from './traceable/tracaable-email.module';
import {NotificationWebhookModule} from './webhook/webhook.module';
import {NotificationService} from './notification.service';

@Global()
@Module({
  imports: [
    EmailModule,
    SmsModule,
    TraceableEmailModule,
    NotificationWebhookModule,
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
