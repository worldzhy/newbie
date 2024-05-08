import {Module, Global} from '@nestjs/common';
import {BullModule} from '@nestjs/bull';
import {VoilaNorbertModule} from '@microservices/people-finder/voila-norbert/module';
import {ProxycurlModule} from '@microservices/people-finder/proxycurl/module';
import {PeopledatalabsModule} from '@microservices/people-finder/peopledatalabs/module';
import {PeopleFinderService} from './people-finder.service';
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
@Global()
@Module({
  imports: [
    PeopleFinderQueueDynamicModule,
    VoilaNorbertModule,
    ProxycurlModule,
    PeopledatalabsModule,
  ],
  providers: [PeopleFinderJobProcessor, PeopleFinderService],
  exports: [PeopleFinderQueueDynamicModule, PeopleFinderService],
})
export class PeopleFinderModule {}
