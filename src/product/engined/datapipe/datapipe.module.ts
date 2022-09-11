import {Module} from '@nestjs/common';
import {DatapipeController} from './datapipe.controller';
import {DatapipeService} from './datapipe.service';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {DatapipeBatchProcessingModule} from './batch-processing/batch-processing.module';
import {DatapipeStreamProcessingModule} from './stream-processing/stream-processing.module';

@Module({
  imports: [
    PrismaModule,
    DatapipeBatchProcessingModule,
    DatapipeStreamProcessingModule,
  ],
  controllers: [DatapipeController],
  providers: [DatapipeService],
  exports: [DatapipeService],
})
export class DatapipeModule {}
