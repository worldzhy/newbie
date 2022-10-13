import {Module} from '@nestjs/common';
import {ProcessingStepController} from './processing-step.controller';
import {ProcessingStepService} from './processing-step.service';

@Module({
  controllers: [ProcessingStepController],
  providers: [ProcessingStepService],
  exports: [ProcessingStepService],
})
export class ProcessingStepModule {}
