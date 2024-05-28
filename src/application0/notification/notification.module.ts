import {Module} from '@nestjs/common';
import {NotificationController} from './notification.controller';
import {App0NotificationWebhookModule} from './webhook/webhook.module';

@Module({
  imports: [App0NotificationWebhookModule],
  controllers: [NotificationController],
})
export class App0NotificationModule {}
