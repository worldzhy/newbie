import {Global, Module} from '@nestjs/common';
import {TaskController} from './task.controller';
import {TaskService} from './task.service';

@Global()
@Module({
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
