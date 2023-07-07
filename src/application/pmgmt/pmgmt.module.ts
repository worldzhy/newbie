import {Module} from '@nestjs/common';
import {ProjectController} from './project/project.controller';
import {ProjectService} from './project/project.service';
import {ProjectElementController} from './element/element.controller';
import {ProjectElementService} from './element/element.service';
import {ProjectCheckpointController} from './checkpoint/checkpoint.controller';
import {ProjectCheckpointService} from './checkpoint/checkpoint.service';
import {ProjectEnvironmentController} from './environment/environment.controller';
import {ProjectEnvironmentService} from './environment/environment.service';
import {PulumiStackService} from './infrastructure/pulumi/pulumi.service';
import {CloudFormationStackService} from './infrastructure/cloudformation/cloudformation.service';
import {ProjectInfrastructureStackController} from './infrastructure/infrastructure-stack.controller';
import {ProjectInfrastructureStackService} from './infrastructure/infrastructure-stack.service';

@Module({
  controllers: [
    ProjectController,
    ProjectElementController,
    ProjectCheckpointController,
    ProjectEnvironmentController,
    ProjectInfrastructureStackController,
  ],
  providers: [
    ProjectService,
    ProjectElementService,
    ProjectCheckpointService,
    ProjectEnvironmentService,
    ProjectInfrastructureStackService,
    CloudFormationStackService,
    PulumiStackService,
  ],
  exports: [
    ProjectService,
    ProjectElementService,
    ProjectCheckpointService,
    ProjectEnvironmentService,
    ProjectInfrastructureStackService,
    CloudFormationStackService,
    PulumiStackService,
  ],
})
export class ProjectManagementModule {}
