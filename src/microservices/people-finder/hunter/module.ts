import {Module} from '@nestjs/common';
import {HunterService} from './hunter.service';

@Module({
  providers: [HunterService],
  exports: [HunterService],
})
export class HunterModule {}
