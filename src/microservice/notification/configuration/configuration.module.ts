import {Module} from '@nestjs/common';
import {NotificationConfigurationController} from './configuration.controller';
import {NotificationConfigurationService} from './configuration.service';
import {PrismaModule} from '../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationConfigurationController],
  providers: [NotificationConfigurationService],
  exports: [NotificationConfigurationService],
})
export class NotificationConfigurationModule {}
