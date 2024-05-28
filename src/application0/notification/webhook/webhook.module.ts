import {Module} from '@nestjs/common';
import {NotificationWebhookController} from './webhook.controller';
import {NotificationWebhookModule} from '@microservices/notification/webhook/webhook.module';

@Module({
  imports: [NotificationWebhookModule],
  providers: [],
  controllers: [NotificationWebhookController],
})
export class App0NotificationWebhookModule {}
