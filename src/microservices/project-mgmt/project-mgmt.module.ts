import {Global, Module} from '@nestjs/common';
import {CloudFormationStackService} from './infrastructure/cloudformation/cloudformation.service';
import {PulumiStackService} from './infrastructure/pulumi/pulumi.service';
import {InfrastructureService} from './infrastructure/infrastructure.service';

@Global()
@Module({
  providers: [
    InfrastructureService,
    CloudFormationStackService,
    PulumiStackService,
  ],
  exports: [
    InfrastructureService,
    CloudFormationStackService,
    PulumiStackService,
  ],
})
export class ProjectManagementModule {}
