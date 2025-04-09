import {Module} from '@nestjs/common';
import {MixRankService} from './mixrank.service';

@Module({
  providers: [MixRankService],
  exports: [MixRankService],
})
export class MixRankModule {}
