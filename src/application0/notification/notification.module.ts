import {Module} from '@nestjs/common';
import {NotificationModule} from '@microservices/notification/notification.module';
import {NotificationController} from './notification.controller';
import {SimpleEmailController} from './email/simple-email.controller';
import {TraceableEmailController} from './email/traceable-email.controller';
import {NotificationWebhookController} from './webhook/webhook.controller';

@Module({
  imports: [NotificationModule],
  controllers: [
    NotificationController,
    SimpleEmailController,
    TraceableEmailController,
    NotificationWebhookController,
  ],
})
export class App0NotificationModule {}
