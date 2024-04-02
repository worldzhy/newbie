import {Global, Module} from '@nestjs/common';
import {AwsS3Service} from './aws-s3.service';
import {AwsSqsService} from './aws-sqs.service';
import {AwsPinpointService} from './aws-pinpoint.service';

@Global()
@Module({
  providers: [AwsS3Service, AwsSqsService, AwsPinpointService],
  exports: [AwsS3Service, AwsSqsService, AwsPinpointService],
})
export class AwsSaaSModule {}
