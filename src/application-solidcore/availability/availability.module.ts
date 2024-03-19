import {Module} from '@nestjs/common';
import {AvailabilityLoadController} from './availability-load-manually.controller';
import {AvailabilityJobProducer} from './availability-job.producer';
import {AvailabilityJobConsumer} from './availability-job.consumer';
import {AvailabilityLoadService} from './availability-load.service';

@Module({
  controllers: [AvailabilityLoadController],
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
