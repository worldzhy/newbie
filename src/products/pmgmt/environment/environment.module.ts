import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {EnvironmentService} from './environment.service';

@Module({
  imports: [PrismaModule],
  providers: [EnvironmentService],
  exports: [EnvironmentService],
})
export class EnvironmentModule {}
