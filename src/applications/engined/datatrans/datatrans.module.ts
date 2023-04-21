import {Module} from '@nestjs/common';
import {DatatransPipelineModule} from './pipeline/pipeline.module';
import {DatatransMissionModule} from './mission/mission.module';
import {DatatransTaskModule} from './mission/task/task.module';

@Module({
  imports: [
    DatatransPipelineModule,
    DatatransMissionModule,
    DatatransTaskModule,
  ],
})
export class DatatransModule {}
