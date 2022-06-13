import {Module} from '@nestjs/common';
import {S3Service} from './_s3/_s3.service';
import {S3Controller} from './_s3/_s3.controller';
import {SqsService} from './_sqs/_sqs.service';
import {SqsController} from './_sqs/_sqs.controller';
import {SnsService} from './_sns/_sns.service';
import {SnsController} from './_sns/_sns.controller';
import {PinpointService} from './_pinpoint/_pinpoint.service';
import {PinpointController} from './_pinpoint/_pinpoint.controller';

@Module({
  imports: [],
  providers: [S3Service, SqsService, SnsService, PinpointService],
  controllers: [S3Controller, SqsController, SnsController, PinpointController],
  exports: [SqsService, S3Service, SnsService, PinpointService],
})
export class AwsModule {}
