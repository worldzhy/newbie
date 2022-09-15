import {Module} from '@nestjs/common';
import {CustomLoggerModule} from '../logger/custom-logger.module';
import {PrismaService} from './prisma.service';

@Module({
  imports: [CustomLoggerModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
