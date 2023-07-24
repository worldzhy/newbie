import {Global, Module} from '@nestjs/common';
import {LocationService} from './location.service';

@Global()
@Module({
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
