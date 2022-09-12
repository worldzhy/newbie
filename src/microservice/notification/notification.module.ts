import {Module} from '@nestjs/common';
import {EmailModule} from './email/email.module';
import {SmsModule} from './sms/sms.module';
import {NotificationConfigurationModule} from './configuration/configuration.module';

@Module({
  imports: [EmailModule, SmsModule, NotificationConfigurationModule],
})
export class NotificationModule {}
