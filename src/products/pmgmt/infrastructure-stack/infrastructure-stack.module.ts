import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {EnvironmentModule} from '../environment/environment.module';
import {InfrastructureStackController} from './infrastructure-stack.controller';
import {InfrastructureStackService} from './infrastructure-stack.service';

@Module({
  imports: [PrismaModule, EnvironmentModule],
  controllers: [InfrastructureStackController],
  providers: [InfrastructureStackService],
  exports: [InfrastructureStackService],
})
export class InfrastructureStackModule {}
