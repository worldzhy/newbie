import {Module} from '@nestjs/common';
import {ProjectController} from './project/project.controller';
import {ProjectService} from './project/project.service';
import {ProjectElementController} from './element/element.controller';
import {ProjectElementService} from './element/element.service';
import {ProjectCheckpointController} from './checkpoint/checkpoint.controller';
import {ProjectCheckpointService} from './checkpoint/checkpoint.service';
import {ProjectEnvironmentController} from './environment/environment.controller';
import {ProjectEnvironmentService} from './environment/environment.service';
import {PulumiStackController} from './infrastructure/pulumi-stack/pulumi-stack.controller';
import {PulumiStackService} from './infrastructure/pulumi-stack/pulumi-stack.service';
import {CloudFormationStackController} from './infrastructure/cloudformation-stack/cloudformation-stack.controller';
import {CloudFormationStackService} from './infrastructure/cloudformation-stack/cloudformation-stack.service';

@Module({
  controllers: [
    ProjectController,
    ProjectElementController,
    ProjectCheckpointController,
    ProjectEnvironmentController,
    CloudFormationStackController,
    PulumiStackController,
  ],
  providers: [
    ProjectService,
    ProjectElementService,
    ProjectCheckpointService,
    ProjectEnvironmentService,
    CloudFormationStackService,
    PulumiStackService,
  ],
  exports: [
    ProjectService,
    ProjectElementService,
    ProjectCheckpointService,
    ProjectEnvironmentService,
    CloudFormationStackService,
    PulumiStackService,
  ],
})
export class ProjectManagementModule {}
