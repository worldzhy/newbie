import {Module} from '@nestjs/common';
import {ProjectController} from '@application/pmgmt/project/project.controller';
import {ProjectService} from '@application/pmgmt/project/project.service';
import {ProjectElementController} from '@application/pmgmt/element/element.controller';
import {ProjectElementService} from '@application/pmgmt/element/element.service';
import {ProjectCheckpointController} from '@application/pmgmt/checkpoint/checkpoint.controller';
import {ProjectCheckpointService} from '@application/pmgmt/checkpoint/checkpoint.service';
import {ProjectEnvironmentController} from '@application/pmgmt/environment/environment.controller';
import {ProjectEnvironmentService} from '@application/pmgmt/environment/environment.service';
import {PulumiStackService} from '@application/pmgmt/infrastructure/pulumi/pulumi.service';
import {CloudFormationStackService} from '@application/pmgmt/infrastructure/cloudformation/cloudformation.service';
import {ProjectInfrastructureStackController} from '@application/pmgmt/infrastructure/infrastructure-stack.controller';
import {ProjectInfrastructureStackService} from '@application/pmgmt/infrastructure/infrastructure-stack.service';

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
