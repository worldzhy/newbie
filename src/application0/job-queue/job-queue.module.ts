import {Module} from '@nestjs/common';
import {JobQueueController} from './job-queue.controller';

@Module({
  controllers: [JobQueueController],
})
export class App0JobQueueModule {}
