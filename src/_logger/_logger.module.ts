import {Module} from '@nestjs/common';
import {CustomLoggerService} from './_logger.service';
import {AwsModule} from '../toolkits/aws/aws.module';

@Module({
  imports: [AwsModule],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class CustomLoggerModule {}
