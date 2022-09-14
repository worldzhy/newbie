import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../../_prisma/_prisma.module';
import {CloudFormationController} from './cloudformation-stack.controller';
import {CloudFormationStackService} from './cloudformation-stack.service';

@Module({
  imports: [PrismaModule],
  controllers: [CloudFormationController],
  providers: [CloudFormationStackService],
  exports: [CloudFormationStackService],
})
export class CloudFormationStackModule {}
