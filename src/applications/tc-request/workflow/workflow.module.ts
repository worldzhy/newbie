import {Module} from '@nestjs/common';
import {TcWorkflowTrailModule} from './trail/trail.module';
import {TcWorkflowService} from './workflow.service';
import {CitizenWorkflowController} from './citizen/citizen.controller';
import {OfficerWorkflowController} from './officer/officer.controller';

@Module({
  imports: [TcWorkflowTrailModule],
  controllers: [CitizenWorkflowController, OfficerWorkflowController],
  providers: [TcWorkflowService],
  exports: [TcWorkflowService],
})
export class TcWorkflowModule {}
