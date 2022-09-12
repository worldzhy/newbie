import {Module} from '@nestjs/common';
import {DatatransPipelineModule} from './pipeline/pipeline.module';
import {DatatransBatchProcessingModule} from './batch-processing/batch-processing.module';
import {DatatransStreamProcessingModule} from './stream-processing/stream-processing.module';

@Module({
  imports: [
    DatatransPipelineModule,
    DatatransBatchProcessingModule,
    DatatransStreamProcessingModule,
  ],
})
export class DatatransModule {}
