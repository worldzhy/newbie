import {Global, Module} from '@nestjs/common';
import {S3Service} from './aws.s3.service';
import {SqsService} from './aws.sqs.service';
import {PinpointService} from './aws.pinpoint.service';

@Global()
@Module({
  providers: [S3Service, SqsService, PinpointService],
  exports: [S3Service, SqsService, PinpointService],
})
export class AwsModule {}
