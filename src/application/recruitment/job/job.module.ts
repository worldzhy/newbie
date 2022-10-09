import {Module} from '@nestjs/common';
import {JobController} from './job.controller';
import {JobService} from './job.service';

@Module({
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
