import {Module} from '@nestjs/common';
import {SimpleEmailController} from './email/simple-email.controller';
import {TraceableEmailController} from './email/traceable-email.controller';
import {NotificationWebhookController} from './webhook/webhook.controller';

@Module({
  controllers: [
    SimpleEmailController,
    TraceableEmailController,
    NotificationWebhookController,
  ],
})
export class App0NotificationModule {}
