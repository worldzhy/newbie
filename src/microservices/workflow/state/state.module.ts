import {Module} from '@nestjs/common';
import {WorkflowStateController} from './state.controller';
import {WorkflowStateService} from './state.service';

@Module({
  controllers: [WorkflowStateController],
  providers: [WorkflowStateService],
  exports: [WorkflowStateService],
})
export class WorkflowStateModule {}
