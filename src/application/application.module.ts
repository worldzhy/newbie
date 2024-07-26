import {Module} from '@nestjs/common';
import {FrameworkModule} from '@framework/framework.module';
import {MicroservicesModule} from '@microservices/microservices.module';

import {ApplicationController} from './application.controller';
import {AwsEnvironmentController} from './cloud/environment.controller';
import {AwsResourceStackController} from './cloud/resource-stack.controller';
import {ProjectNoteController} from './project/note.controller';
import {ProjectController} from './project/project.controller';

@Module({
  imports: [FrameworkModule, MicroservicesModule],
  controllers: [
    ApplicationController,
    AwsEnvironmentController,
    AwsResourceStackController,
    ProjectNoteController,
    ProjectController,
  ],
})
export class ApplicationModule {}
