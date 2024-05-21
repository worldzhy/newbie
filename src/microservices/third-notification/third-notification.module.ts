import {Module, Global} from '@nestjs/common';
import {FeishuNotificationModule} from './feishu/module';
import {ThirdNotificationService} from './third-notification.service';

@Global()
@Module({
  imports: [FeishuNotificationModule],
  providers: [ThirdNotificationService],
  exports: [ThirdNotificationService, FeishuNotificationModule],
})
export class ThirdNotificationModule {}
