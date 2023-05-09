import {Module} from '@nestjs/common';
import {WorkflowViewController} from './view.controller';
import {WorkflowViewService} from './view.service';

@Module({
  controllers: [WorkflowViewController],
  providers: [WorkflowViewService],
  exports: [WorkflowViewService],
})
export class WorkflowViewModule {}
