import {Module} from '@nestjs/common';
import {TcWorkflowTrailModule} from './trail/trail.module';
import {TcWorkflowController} from './workflow.controller';
import {TcWorkflowService} from './workflow.service';

@Module({
  imports: [TcWorkflowTrailModule],
  controllers: [TcWorkflowController],
  providers: [TcWorkflowService],
  exports: [TcWorkflowService],
})
export class TcWorkflowModule {}
