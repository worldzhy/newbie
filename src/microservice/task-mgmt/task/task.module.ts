import {Module} from '@nestjs/common';
import {AwsModule} from '../../../_aws/_aws.module';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {TaskConfigurationModule} from '../configuration/configuration.module';
import {TaskController} from './task.controller';
import {TaskService} from './task.service';

@Module({
  imports: [PrismaModule, AwsModule, TaskConfigurationModule],
  controllers: [TaskController],
  providers: [
    {
      provide: 'TaskConfiguration',
      useValue: 'task-configuration',
    },
    TaskService,
  ],
  exports: [TaskService],
})
export class TaskModule {}
