import {Module} from '@nestjs/common';
import {PrismaModule} from '../../_prisma/_prisma.module';
import {TaskGroupModule} from './task-group/task-group.module';
import {TaskModule} from './task/task.module';

@Module({
  imports: [PrismaModule, TaskGroupModule, TaskModule],
})
export class TaskManagementModule {}
