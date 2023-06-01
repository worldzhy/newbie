import {Module} from '@nestjs/common';
import {DatatransTaskController} from './task.controller';
import {DatatransTaskService} from './task.service';

@Module({
  controllers: [DatatransTaskController],
  providers: [DatatransTaskService],
  exports: [DatatransTaskService],
})
export class DatatransTaskModule {}
