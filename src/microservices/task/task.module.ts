import {Global, Module} from '@nestjs/common';
import {TaskService} from './task.service';

@Global()
@Module({
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
