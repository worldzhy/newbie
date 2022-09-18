import {Module} from '@nestjs/common';
import {EmailNotificationController} from './email.controller';
import {EmailNotificationService} from './email.service';

@Module({
  controllers: [EmailNotificationController],
  providers: [EmailNotificationService],
  exports: [EmailNotificationService],
})
export class EmailModule {}
