import {Global, Module} from '@nestjs/common';
import {S3Service} from './aws.s3.service';
import {SqsService} from './aws.sqs.service';
import {SnsService} from './aws.sns.service';
import {PinpointService} from './aws.pinpoint.service';
import {AwsController} from './aws.controller';

@Global()
@Module({
  controllers: [AwsController],
  providers: [S3Service, SqsService, SnsService, PinpointService],
  exports: [S3Service, SqsService, SnsService, PinpointService],
})
export class AwsModule {}
