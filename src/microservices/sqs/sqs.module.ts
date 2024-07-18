import {Global, Module} from '@nestjs/common';
import {AwsSqsService} from './sqs.service';

@Global()
@Module({
  providers: [AwsSqsService],
  exports: [AwsSqsService],
})
export class AwsSqsModule {}
