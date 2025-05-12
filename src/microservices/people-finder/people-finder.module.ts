import {Module, Global} from '@nestjs/common';
import {VoilaNorbertModule} from '@microservices/people-finder/voila-norbert/module';
import {ProxycurlModule} from '@microservices/people-finder/proxycurl/module';
import {PeopledatalabsModule} from '@microservices/people-finder/peopledatalabs/module';
import {MixRankModule} from '@microservices/people-finder/mixrank/module';
import {SnovModule} from '@microservices/people-finder/snov/module';
import {PeopleFinderService} from './people-finder.service';
import {PeopleFinderNotificationService} from './people-finder.notification.service';

@Global()
@Module({
  imports: [
    VoilaNorbertModule,
    ProxycurlModule,
    PeopledatalabsModule,
    MixRankModule,
    SnovModule,
  ],
  providers: [PeopleFinderService, PeopleFinderNotificationService],
  exports: [
    PeopleFinderService,
    PeopleFinderNotificationService,
    VoilaNorbertModule,
    ProxycurlModule,
    PeopledatalabsModule,
    MixRankModule,
    SnovModule,
  ],
})
export class PeopleFinderModule {}
