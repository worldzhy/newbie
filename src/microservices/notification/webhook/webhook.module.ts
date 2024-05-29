import {Module, Global} from '@nestjs/common';
import {NotificationWebhookService} from './webhook.service';
import {FeishuWebhookService} from './feishu/feishu-webhook.service';

@Global()
@Module({
  providers: [NotificationWebhookService, FeishuWebhookService],
  exports: [NotificationWebhookService, FeishuWebhookService],
})
export class NotificationWebhookModule {}
