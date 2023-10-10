import {Global, Module} from '@nestjs/common';
import {RawDataService} from './raw-data.service';

@Global()
@Module({
  providers: [RawDataService],
  exports: [RawDataService],
})
export class RawDataModule {}
