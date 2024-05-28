import {Module, Global} from '@nestjs/common';
import {FeishuNotificationModule} from './feishu/module';
import {NotificationWebhookService} from './webhook.service';

@Global()
@Module({
  imports: [FeishuNotificationModule],
  providers: [NotificationWebhookService],
  exports: [NotificationWebhookService, FeishuNotificationModule],
})
export class NotificationWebhookModule {}
