import {Global, Module} from '@nestjs/common';
import {GmapPlaceService} from './gmap-place.service';

@Global()
@Module({
  providers: [GmapPlaceService],
  exports: [GmapPlaceService],
})
export class GmapModule {}
