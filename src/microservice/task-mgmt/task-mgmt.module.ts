import {Module} from '@nestjs/common';
import {TaskModule} from './task/task.module';
import {TaskConfigurationModule} from './configuration/configuration.module';

@Module({
  imports: [TaskModule, TaskConfigurationModule],
})
export class TaskManagementModule {}
