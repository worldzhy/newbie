import {Module} from '@nestjs/common';
import {AvailabilityExpressionController} from './availability-expression.controller';
import {AvailabilityUploadController} from './availability-upload.controller';
import {AvailabilityTaskProducer} from './availability-task.producer';
import {AvailabilityTaskConsumer} from './availability-task.consumer';

@Module({
  controllers: [AvailabilityExpressionController, AvailabilityUploadController],
  providers: [AvailabilityTaskProducer, AvailabilityTaskConsumer],
  exports: [AvailabilityTaskProducer, AvailabilityTaskConsumer],
})
export class AvailabilityModule {}
