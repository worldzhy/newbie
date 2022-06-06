import {Module} from '@nestjs/common';
import {MicroserviceController} from './microservice.controller';
import {MicroserviceService} from './microservice.service';
import {PrismaModule} from '../../_prisma/_prisma.module';
import {InfrastructureStackModule} from '../infrastructure-stack/infrastructure-stack.module';

@Module({
  imports: [PrismaModule, InfrastructureStackModule],
  controllers: [MicroserviceController],
  providers: [MicroserviceService],
  exports: [MicroserviceService],
})
export class MicroserviceModule {}
