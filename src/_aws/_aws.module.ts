import {Module} from '@nestjs/common';
import {S3Service} from './_s3.service';
import {SqsService} from './_sqs.service';
import {SnsService} from './_sns.service';
import {PinpointService} from './_pinpoint.service';
import {AwsController} from './_aws.controller';

@Module({
  controllers: [AwsController],
  providers: [
    {provide: 'SqsConfiguration', useValue: 'sqs-configuration'},
    {provide: 'PinpointConfiguration', useValue: 'pinpoint-configuration'},
    S3Service,
    SqsService,
    SnsService,
    PinpointService,
  ],
  exports: [S3Service, SqsService, SnsService, PinpointService],
})
export class AwsModule {}
