import {Module} from '@nestjs/common';
import {PeopleFinderController} from './people-finder.controller';
import {PeopleFinderModule} from '@microservices/people-finder/people-finder.module';
import {BullModule} from '@nestjs/bull';
import {
  PeopleFinderQueue,
  PeopleFinderJobProcessor,
} from './people-finder.processor';

const PeopleFinderQueueDynamicModule = BullModule.registerQueue({
  name: PeopleFinderQueue,
  limiter: {
    max: 9, // max 9 task
    duration: 60000, // 1 minutes
  },
});

@Module({
  imports: [PeopleFinderModule, PeopleFinderQueueDynamicModule],
  providers: [PeopleFinderJobProcessor],
  controllers: [PeopleFinderController],
})
export class App0PeopleFinderModule {}
