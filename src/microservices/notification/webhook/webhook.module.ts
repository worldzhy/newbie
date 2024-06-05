import {Module, Global} from '@nestjs/common';
import {NotificationWebhookService} from './webhook.service';
import {FeishuWebhookService} from './feishu/feishu-webhook.service';
import {SlackWebhookService} from './slack/slack-webhook.service';

@Global()
@Module({
  providers: [
    NotificationWebhookService,
    FeishuWebhookService,
    SlackWebhookService,
  ],
  exports: [
    NotificationWebhookService,
    FeishuWebhookService,
    SlackWebhookService,
  ],
})
export class NotificationWebhookModule {}
