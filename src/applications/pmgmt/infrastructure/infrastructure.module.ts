import {Module} from '@nestjs/common';
import {CloudFormationStackModule} from './cloudformation-stack/cloudformation-stack.module';
import {PulumiStackModule} from './pulumi-stack/pulumi-stack.module';

@Module({
  imports: [CloudFormationStackModule, PulumiStackModule],
})
export class InfrastructureModule {}
