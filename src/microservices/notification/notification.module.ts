import {Global, Module} from '@nestjs/common';
import {NotificationService} from './notification.service';
import {Notification2Service} from './notification2.service';

@Global()
@Module({
  providers: [NotificationService, Notification2Service],
  exports: [NotificationService, Notification2Service],
})
export class NotificationModule {}
