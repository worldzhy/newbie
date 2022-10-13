import {Module} from '@nestjs/common';
import {DatatransPipelineModule} from './pipeline/pipeline.module';
import {DatatransMissionModule} from './mission/mission.module';

@Module({
  imports: [DatatransPipelineModule, DatatransMissionModule],
})
export class DatatransModule {}
