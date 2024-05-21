import {Module} from '@nestjs/common';
import {ThirdNotificationController} from './third-notification.controller';
import {ThirdNotificationModule} from '@microservices/third-notification/third-notification.module';

@Module({
  imports: [ThirdNotificationModule],
  providers: [],
  controllers: [ThirdNotificationController],
})
export class App0ThirdNotificationModule {}
