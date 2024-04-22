import {Module} from '@nestjs/common';
import {PeopleSearchController} from './people-search.controller';
import {VoilaNorbertModule} from '@microservices/cloud/saas/voila-norbert/module';
import {ProxycurlModule} from '@microservices/cloud/saas/proxycurl/module';
import {PeopledatalabsModule} from '@microservices/cloud/saas/peopledatalabs/module';

@Module({
  imports: [VoilaNorbertModule, ProxycurlModule, PeopledatalabsModule],
  controllers: [PeopleSearchController],
})
export class App0PeopleSearchModule {}
