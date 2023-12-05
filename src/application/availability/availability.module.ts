import {Module} from '@nestjs/common';
import {AvailabilityExpressionController} from './availability-expression.controller';
import {AvailabilityUploadController} from './availability-upload.controller';
import {AvailabilityJobProducer} from './availability-job.producer';
import {AvailabilityJobConsumer} from './availability-job.consumer';

@Module({
  controllers: [AvailabilityExpressionController, AvailabilityUploadController],
  providers: [AvailabilityJobProducer, AvailabilityJobConsumer],
  exports: [AvailabilityJobProducer, AvailabilityJobConsumer],
})
export class AvailabilityModule {}
