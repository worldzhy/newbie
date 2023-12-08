import {Global, Module} from '@nestjs/common';
import {CloudFormationStackService} from './infrastructure/cloudformation/cloudformation.service';
import {PulumiStackService} from './infrastructure/pulumi/pulumi.service';

@Global()
@Module({
  providers: [CloudFormationStackService, PulumiStackService],
  exports: [CloudFormationStackService, PulumiStackService],
})
export class ProjectManagementModule {}
