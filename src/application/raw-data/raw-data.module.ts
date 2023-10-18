import {Module} from '@nestjs/common';
import {RawDataService} from './raw-data.service';

@Module({
  providers: [RawDataService],
  exports: [RawDataService],
})
export class RawDataModule {}
