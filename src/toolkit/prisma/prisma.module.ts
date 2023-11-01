import {Global, Module} from '@nestjs/common';
import {CustomLoggerModule} from '../logger/logger.module';
import {PrismaService} from './prisma.service';

@Global()
@Module({
  imports: [CustomLoggerModule],
  providers: [PrismaService /* , Prisma2Service */],
  exports: [PrismaService /* , Prisma2Service */],
})
export class PrismaModule {}
