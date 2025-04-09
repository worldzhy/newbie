import {Module} from '@nestjs/common';
import {PeopleFinderTestController} from './platform-test.controller';
import {PeopleFinderModule} from '@microservices/people-finder/people-finder.module';
import {BullModule} from '@nestjs/bull';
import {
  PeopleFinderTestQueue,
  PeopleFinderJobProcessor,
} from './platform-test.processor';

const PeopleFinderQueueDynamicModule = BullModule.registerQueue({
  name: PeopleFinderTestQueue,
  limiter: {
    max: 20, // max 9 task
    duration: 60000, // 1 minutes
  },
});

@Module({
  imports: [PeopleFinderModule, PeopleFinderQueueDynamicModule],
  providers: [PeopleFinderJobProcessor],
  controllers: [PeopleFinderTestController],
})
export class PeopleFinderTestModule {}
