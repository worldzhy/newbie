import {Module, Global} from '@nestjs/common';
import {NotificationWebhookService} from './webhook.service';
import {FeishuNotificationService} from './feishu/feishu-notification.service';

@Global()
@Module({
  providers: [NotificationWebhookService, FeishuNotificationService],
  exports: [NotificationWebhookService, FeishuNotificationService],
})
export class NotificationWebhookModule {}
