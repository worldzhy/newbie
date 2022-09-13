import {Module} from '@nestjs/common';
import {DatatransBatchProcessingController} from './batch-processing.controller';
import {DatatransBatchProcessingService} from './batch-processing.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';
import {TaskModule} from '../../../../microservice/task/task.module';

@Module({
  imports: [PrismaModule, TaskModule],
  controllers: [DatatransBatchProcessingController],
  providers: [DatatransBatchProcessingService],
  exports: [DatatransBatchProcessingService],
})
export class DatatransBatchProcessingModule {}