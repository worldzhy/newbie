import {Module} from '@nestjs/common';
import {DatatransPipelineController} from './pipeline.controller';
import {DatatransPipelineService} from './pipeline.service';
import {DatasourceModule} from '../../datasource/datasource.module';

@Module({
  imports: [DatasourceModule],
  controllers: [DatatransPipelineController],
  providers: [DatatransPipelineService],
  exports: [DatatransPipelineService],
})
export class DatatransPipelineModule {}
