import {Module} from '@nestjs/common';
import {FeishuNotificationService} from './feishu-notification.service';

@Module({
  providers: [FeishuNotificationService],
  exports: [FeishuNotificationService],
})
export class FeishuNotificationModule {}
