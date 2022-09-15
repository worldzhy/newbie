import {Module} from '@nestjs/common';
import {DatatransStreamProcessingController} from './stream-processing.controller';
import {DatatransStreamProcessingService} from './stream-processing.service';
import {PrismaModule} from '../../../../tools/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DatatransStreamProcessingController],
  providers: [DatatransStreamProcessingService],
  exports: [DatatransStreamProcessingService],
})
export class DatatransStreamProcessingModule {}
