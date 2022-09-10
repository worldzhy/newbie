import {Module} from '@nestjs/common';
import {DatapipeBatchProcessingController} from './batch-processing.controller';
import {DatapipeBatchProcessingService} from './batch-processing.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DatapipeBatchProcessingController],
  providers: [DatapipeBatchProcessingService],
  exports: [DatapipeBatchProcessingService],
})
export class DatapipeBatchProcessingModule {}
