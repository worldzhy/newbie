import {Global, Module} from '@nestjs/common';
import {AwsSqsService} from './aws-sqs.service';

@Global()
@Module({
  providers: [AwsSqsService],
  exports: [AwsSqsService],
})
export class AwsModule {}
