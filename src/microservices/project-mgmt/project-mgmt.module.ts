import {Global, Module} from '@nestjs/common';
import {ProjectCheckpointService} from './checkpoint/checkpoint.service';
import {ProjectEnvironmentService} from './environment/environment.service';
import {ProjectInfrastructureStackService} from './infrastructure/infrastructure-stack.service';
import {CloudFormationStackService} from './infrastructure/cloudformation/cloudformation.service';
import {PulumiStackService} from './infrastructure/pulumi/pulumi.service';
import {ProjectElementService} from './project/project-element.service';
import {ProjectService} from './project/project.service';

@Global()
@Module({
  providers: [
    ProjectCheckpointService,
    ProjectEnvironmentService,
    ProjectInfrastructureStackService,
    CloudFormationStackService,
    PulumiStackService,
    ProjectElementService,
    ProjectService,
  ],
  exports: [
    ProjectCheckpointService,
    ProjectEnvironmentService,
    ProjectInfrastructureStackService,
    CloudFormationStackService,
    PulumiStackService,
    ProjectElementService,
    ProjectService,
  ],
})
export class ProjectManagementModule {}
