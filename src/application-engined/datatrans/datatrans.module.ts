import {Module} from '@nestjs/common';
import {DatatransPipelineController} from './pipeline/pipeline.controller';
import {DatatransMissionController} from './mission/mission.controller';
import {DatatransTaskController} from './mission/task/task.controller';
import {DatatransPipelineService} from './pipeline/pipeline.service';
import {DatasourceModule} from '../datasource/datasource.module';

@Module({
  imports: [DatasourceModule],
  controllers: [
    DatatransPipelineController,
    DatatransMissionController,
    DatatransTaskController,
  ],
  providers: [DatatransPipelineService],
  exports: [DatatransPipelineService],
})
export class DatatransModule {}
