import {Module} from '@nestjs/common';
import {CloudFormationStackController} from './cloudformation-stack.controller';
import {CloudFormationStackService} from './cloudformation-stack.service';

@Module({
  controllers: [CloudFormationStackController],
  providers: [CloudFormationStackService],
  exports: [CloudFormationStackService],
})
export class CloudFormationStackModule {}
