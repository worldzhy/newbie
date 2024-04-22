import {Global, Module} from '@nestjs/common';
import {AwsSqsService} from './aws-sqs.service';
import {AwsPinpointService} from './aws-pinpoint.service';

@Global()
@Module({
  providers: [AwsSqsService, AwsPinpointService],
  exports: [AwsSqsService, AwsPinpointService],
})
export class AwsSaaSModule {}
