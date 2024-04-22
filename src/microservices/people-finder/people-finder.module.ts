import {Module, Global} from '@nestjs/common';
import {VoilaNorbertModule} from '@microservices/people-finder/voila-norbert/module';
import {ProxycurlModule} from '@microservices/people-finder/proxycurl/module';
import {PeopledatalabsModule} from '@microservices/people-finder/peopledatalabs/module';
import {PeopleFinderService} from './people-finder.service';

@Global()
@Module({
  imports: [VoilaNorbertModule, ProxycurlModule, PeopledatalabsModule],
  providers: [PeopleFinderService],
  exports: [PeopleFinderService],
})
export class PeopleFinderModule {}
