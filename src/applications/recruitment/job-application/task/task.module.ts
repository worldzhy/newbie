import {Module} from '@nestjs/common';
import {JobApplicationTaskController} from './task.controller';
import {JobApplicationTaskService} from './task.service';

@Module({
  controllers: [JobApplicationTaskController],
  providers: [JobApplicationTaskService],
  exports: [JobApplicationTaskService],
})
export class JobApplicationTaskModule {}
