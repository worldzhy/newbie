import {Global, Module} from '@nestjs/common';
import {S3Service} from './s3/s3.service';
import {SqsService} from './sqs/sqs.service';
import {SnsService} from './sns/sns.service';
import {PinpointService} from './pinpoint/pinpoint.service';
import {AwsController} from './aws.controller';

@Global()
@Module({
  controllers: [AwsController],
  providers: [S3Service, SqsService, SnsService, PinpointService],
  exports: [S3Service, SqsService, SnsService, PinpointService],
})
export class AwsModule {}
