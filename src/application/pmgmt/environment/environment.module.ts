import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../toolkits/prisma/prisma.module';
import {EnvironmentController} from './environment.controller';
import {EnvironmentService} from './environment.service';

@Module({
  imports: [PrismaModule],
  controllers: [EnvironmentController],
  providers: [EnvironmentService],
  exports: [EnvironmentService],
})
export class EnvironmentModule {}
