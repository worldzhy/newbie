import {Module} from '@nestjs/common';
import {CustomLoggerModule} from '../../_logger/_logger.module';
import {PrismaService} from './prisma.service';

@Module({
  imports: [CustomLoggerModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
