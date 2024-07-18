import {Global, Module} from '@nestjs/common';
import {TraceableEmailService} from './traceable-email.service';
import {AwsSqsService} from './aws.sqs.service';

@Global()
@Module({
  providers: [TraceableEmailService, AwsSqsService],
  exports: [TraceableEmailService],
})
export class TraceableEmailModule {}
