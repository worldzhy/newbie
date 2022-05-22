import {Module} from '@nestjs/common';
import {CustomLoggerModule} from '../_logger/_custom-logger.module';
import {PrismaService} from './_prisma.service';

@Module({
  imports: [CustomLoggerModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
