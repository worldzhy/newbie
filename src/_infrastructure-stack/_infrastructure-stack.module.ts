import {Module} from '@nestjs/common';
import {PrismaModule} from '../_prisma/_prisma.module';
import {InfrastructureStackController} from './_infrastructure-stack.controller';
import {InfrastructureStackService} from './_infrastructure-stack.service';

@Module({
  imports: [PrismaModule],
  controllers: [InfrastructureStackController],
  providers: [InfrastructureStackService],
  exports: [InfrastructureStackService],
})
export class InfrastructureStackModule {}
