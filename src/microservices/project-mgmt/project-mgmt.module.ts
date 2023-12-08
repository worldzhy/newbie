import {Global, Module} from '@nestjs/common';
import {CloudFormationStackService} from './infrastructure/cloudformation/cloudformation.service';
import {PulumiStackService} from './infrastructure/pulumi/pulumi.service';
import {ProjectService} from './project/project.service';

@Global()
@Module({
  providers: [CloudFormationStackService, PulumiStackService, ProjectService],
  exports: [CloudFormationStackService, PulumiStackService, ProjectService],
})
export class ProjectManagementModule {}
