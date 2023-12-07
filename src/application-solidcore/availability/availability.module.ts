import {Module} from '@nestjs/common';
import {AvailabilityExpressionController} from './availability-expression.controller';
import {AvailabilityService} from './availability.service';
import {AvailabilityUploadController} from './availability-load-manually.controller';
import {AvailabilityJobProducer} from './availability-job.producer';
import {AvailabilityJobConsumer} from './availability-job.consumer';

@Module({
  controllers: [AvailabilityExpressionController, AvailabilityUploadController],
  providers: [
    AvailabilityService,
    AvailabilityJobProducer,
    AvailabilityJobConsumer,
  ],
  exports: [
    AvailabilityService,
    AvailabilityJobProducer,
    AvailabilityJobConsumer,
  ],
})
export class AvailabilityModule {}
