import {Module} from '@nestjs/common';
import {CustomLoggerService} from './_logger.service';

@Module({
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class CustomLoggerModule {}
