import {Module} from '@nestjs/common';
import {DatatransStreamProcessingController} from './stream-processing.controller';
import {DatatransStreamProcessingService} from './stream-processing.service';

@Module({
  controllers: [DatatransStreamProcessingController],
  providers: [DatatransStreamProcessingService],
  exports: [DatatransStreamProcessingService],
})
export class DatatransStreamProcessingModule {}
