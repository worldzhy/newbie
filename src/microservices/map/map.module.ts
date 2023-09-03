import {Global, Module} from '@nestjs/common';
import {PlaceService} from './place.service';

@Global()
@Module({
  providers: [PlaceService],
  exports: [PlaceService],
})
export class MapModule {}
