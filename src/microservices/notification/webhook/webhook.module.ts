import {Module, Global} from '@nestjs/common';
import {LarkWebhookService} from './lark/lark.service';
import {SlackWebhookService} from './slack/slack.service';

@Global()
@Module({
  providers: [LarkWebhookService, SlackWebhookService],
  exports: [LarkWebhookService, SlackWebhookService],
})
export class NotificationWebhookModule {}
