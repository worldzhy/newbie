import {Global, Module} from '@nestjs/common';
import {PrismaService} from './prisma.service';

@Global()
@Module({
  providers: [PrismaService /* , Prisma2Service */],
  exports: [PrismaService /* , Prisma2Service */],
})
export class PrismaModule {}
