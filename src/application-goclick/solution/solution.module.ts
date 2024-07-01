import {Module} from '@nestjs/common';
import {SolutionGoogleDriveController} from './google-drive.controller';
import {SolutionSchedulingController} from './scheduling.controller';
import {SolutionWorkflowController} from './workflow.controller';

@Module({
  controllers: [
    SolutionGoogleDriveController,
    SolutionSchedulingController,
    SolutionWorkflowController,
  ],
})
export class AppSolutionModule {}
