import {Module} from '@nestjs/common';
import {S3Service} from './s3.service';
import {SqsService} from './sqs.service';
import {SnsService} from './sns.service';
import {PinpointService} from './pinpoint.service';
import {AwsController} from './aws.controller';

@Module({
  controllers: [AwsController],
  providers: [S3Service, SqsService, SnsService, PinpointService],
  exports: [S3Service, SqsService, SnsService, PinpointService],
})
export class AwsModule {}
