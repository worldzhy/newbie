import {Module} from '@nestjs/common';
import {JobApplicationWorkflowTrailController} from './trail.controller';
import {JobApplicationWorkflowTrailService} from './trail.service';

@Module({
  controllers: [JobApplicationWorkflowTrailController],
  providers: [JobApplicationWorkflowTrailService],
  exports: [JobApplicationWorkflowTrailService],
})
export class JobApplicationWorkflowTrailModule {}
