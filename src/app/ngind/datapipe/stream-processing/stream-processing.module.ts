import {Module} from '@nestjs/common';
import {DatapipeStreamProcessingController} from './stream-processing.controller';
import {DatapipeStreamProcessingService} from './stream-processing.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DatapipeStreamProcessingController],
  providers: [DatapipeStreamProcessingService],
  exports: [DatapipeStreamProcessingService],
})
export class DatapipeStreamProcessingModule {}
