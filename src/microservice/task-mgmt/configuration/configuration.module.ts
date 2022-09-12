import {Module} from '@nestjs/common';
import {TaskConfigurationController} from './configuration.controller';
import {TaskConfigurationService} from './configuration.service';
import {PrismaModule} from '../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TaskConfigurationController],
  providers: [TaskConfigurationService],
  exports: [TaskConfigurationService],
})
export class TaskConfigurationModule {}
