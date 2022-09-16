import {Module} from '@nestjs/common';
import {DatatransBatchProcessingController} from './batch-processing.controller';
import {DatatransBatchProcessingService} from './batch-processing.service';
import {TaskModule} from '../../../../microservices/task/task.module';

@Module({
  imports: [TaskModule],
  controllers: [DatatransBatchProcessingController],
  providers: [DatatransBatchProcessingService],
  exports: [DatatransBatchProcessingService],
})
export class DatatransBatchProcessingModule {}
