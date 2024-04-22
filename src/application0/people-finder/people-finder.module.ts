import {Module} from '@nestjs/common';
import {PeopleFinderController} from './people-finder.controller';
import {PeopleFinderModule} from '@microservices/people-finder/people-finder.module';

@Module({
  imports: [PeopleFinderModule],
  controllers: [PeopleFinderController],
})
export class App0PeopleFinderModule {}
