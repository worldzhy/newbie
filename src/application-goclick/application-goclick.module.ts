import {Module} from '@nestjs/common';
import {Application0Module} from '@application0/application0.module';

import {ApplicationGoClickController} from './application-goclick.controller';
import {ShortcutController} from './shortcut/shortcut.controller';
import {SolutionGoogleDriveController} from './solution/google-drive.controller';
import {SolutionSchedulingController} from './solution/scheduling.controller';
import {SolutionWorkflowController} from './solution/workflow.controller';

@Module({
  imports: [
    Application0Module, // BEAT IT!
  ],
  controllers: [
    ApplicationGoClickController,
    ShortcutController,
    SolutionGoogleDriveController,
    SolutionSchedulingController,
    SolutionWorkflowController,
  ],
})
export class ApplicationGoClickModule {}
