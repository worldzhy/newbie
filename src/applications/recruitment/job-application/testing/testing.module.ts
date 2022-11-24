import {Module} from '@nestjs/common';
import {JobApplicationTestingWorkflowModule} from './workflow/testing-workflow.module';
import {JobApplicationTestingController} from './testing.controller';
import {JobApplicationTestingService} from './testing.service';

@Module({
  imports: [JobApplicationTestingWorkflowModule],
  controllers: [JobApplicationTestingController],
  providers: [JobApplicationTestingService],
  exports: [JobApplicationTestingService],
})
export class JobApplicationTestingModule {}
