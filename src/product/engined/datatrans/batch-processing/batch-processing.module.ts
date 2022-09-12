import {Module} from '@nestjs/common';
import {DatatransBatchProcessingController} from './batch-processing.controller';
import {DatatransBatchProcessingService} from './batch-processing.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';
import {TaskManagementModule} from '../../../../microservice/task-mgmt/task-mgmt.module';

@Module({
  imports: [PrismaModule, TaskManagementModule],
  controllers: [DatatransBatchProcessingController],
  providers: [DatatransBatchProcessingService],
  exports: [DatatransBatchProcessingService],
})
export class DatatransBatchProcessingModule {}
