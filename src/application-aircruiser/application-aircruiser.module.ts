import {Module} from '@nestjs/common';
import {FrameworkModule} from '@framework/framework.module';
import {MicroserviceModule} from '@microservices/microservice.module';

import {ApplicationAircruiserController} from './application-aircruiser.controller';
import {AwsEnvironmentController} from './cloud/environment.controller';
import {AwsResourceStackController} from './cloud/resource-stack.controller';
import {ProjectNoteController} from './project/note.controller';
import {ProjectController} from './project/project.controller';

@Module({
  imports: [FrameworkModule, MicroserviceModule],
  controllers: [
    ApplicationAircruiserController,
    AwsEnvironmentController,
    AwsResourceStackController,
    ProjectNoteController,
    ProjectController,
  ],
})
export class ApplicationAircruiserModule {}
