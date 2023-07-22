import {Global, Module} from '@nestjs/common';
import {LocationController} from './location.controller';
import {LocationService} from './location.service';

@Global()
@Module({
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
