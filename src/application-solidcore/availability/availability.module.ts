import {Module} from '@nestjs/common';
import {AvailabilityExpressionController} from './availability-expression.controller';
import {AvailabilityLoadController} from './availability-load-manually.controller';
import {AvailabilityJobProducer} from './availability-job.producer';
import {AvailabilityJobConsumer} from './availability-job.consumer';
import {AvailabilityLoadService} from './availability-load.service';

@Module({
  controllers: [AvailabilityExpressionController, AvailabilityLoadController],
  providers: [
    AvailabilityJobProducer,
    AvailabilityJobConsumer,
    AvailabilityLoadService,
  ],
  exports: [
    AvailabilityJobProducer,
    AvailabilityJobConsumer,
    AvailabilityLoadService,
  ],
})
export class AvailabilityModule {}
