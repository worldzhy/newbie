import {Module} from '@nestjs/common';
import {TcWorkflowTrailController} from './trail.controller';
import {TcWorkflowTrailService} from './trail.service';

@Module({
  controllers: [TcWorkflowTrailController],
  providers: [TcWorkflowTrailService],
  exports: [TcWorkflowTrailService],
})
export class TcWorkflowTrailModule {}
