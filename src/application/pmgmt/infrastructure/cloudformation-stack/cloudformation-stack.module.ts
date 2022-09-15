import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../../tools/prisma/prisma.module';
import {CloudFormationStackController} from './cloudformation-stack.controller';
import {CloudFormationStackService} from './cloudformation-stack.service';

@Module({
  imports: [PrismaModule],
  controllers: [CloudFormationStackController],
  providers: [CloudFormationStackService],
  exports: [CloudFormationStackService],
})
export class CloudFormationStackModule {}
