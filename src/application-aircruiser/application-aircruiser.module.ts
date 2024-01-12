import {Module} from '@nestjs/common';
import {Application0Module} from '@application0/application0.module';

import {ApplicationAircruiserController} from './application-aircruiser.controller';
import {ProjectCheckpointController} from './project-mgmt/checkpoint.controller';
import {ProjectEnvironmentController} from './project-mgmt/environment.controller';
import {ProjectInfrastructureController} from './project-mgmt/infrastructure.controller';
import {ProjectNoteController} from './project-mgmt/note.controller';
import {ProjectController} from './project-mgmt/project.controller';

@Module({
  imports: [
    Application0Module, // BEAT IT!
  ],
  controllers: [
    ApplicationAircruiserController,
    ProjectCheckpointController,
    ProjectEnvironmentController,
    ProjectInfrastructureController,
    ProjectNoteController,
    ProjectController,
  ],
})
export class ApplicationAircruiserModule {}
