import {Module} from '@nestjs/common';
import {AvailabilityLoadController} from './availability-load-manually.controller';
import {AvailabilityJobProducer} from './availability-job.producer';
import {AvailabilityLoadService} from './availability-load.service';

@Module({
  controllers: [AvailabilityLoadController],
  providers: [AvailabilityJobProducer, AvailabilityLoadService],
  exports: [AvailabilityJobProducer, AvailabilityLoadService],
})
export class AvailabilityModule {}
