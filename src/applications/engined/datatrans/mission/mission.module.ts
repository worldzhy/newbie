import {Module} from '@nestjs/common';
import {TaskModule} from '../../../../microservices/task/task.module';
import {DatatransMissionController} from './mission.controller';
import {DatatransMissionService} from './mission.service';

@Module({
  imports: [TaskModule],
  controllers: [DatatransMissionController],
  providers: [DatatransMissionService],
  exports: [DatatransMissionService],
})
export class DatatransMissionModule {}
