import {Global, Module} from '@nestjs/common';
import {TraceableEmailService} from './traceable-email.service';

@Global()
@Module({
  providers: [TraceableEmailService],
  exports: [TraceableEmailService],
})
export class TraceableEmailModule {}
