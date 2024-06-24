import {Module} from '@nestjs/common';
import {Application0Module} from '@application0/application0.module';
import {ApplicationGoClickModule} from '@/applicationGoclick/applicationGoClick.module';

import {ApplicationAircruiserController} from './application-aircruiser.controller';
import {AwsEnvironmentController} from './cloud/environment.controller';
import {AwsResourceStackController} from './cloud/resource-stack.controller';
import {ProjectNoteController} from './project/note.controller';
import {ProjectController} from './project/project.controller';

@Module({
  imports: [
    Application0Module, // BEAT IT!
    ApplicationGoClickModule,
  ],
  controllers: [
    ApplicationAircruiserController,
    AwsEnvironmentController,
    AwsResourceStackController,
    ProjectNoteController,
    ProjectController,
  ],
})
export class ApplicationAircruiserModule {}
