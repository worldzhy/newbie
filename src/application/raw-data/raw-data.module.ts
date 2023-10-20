import {Module} from '@nestjs/common';
import {RawDataBasicService} from './raw-data-basic.service';
import {RawDataSchedulingService} from './raw-data-scheduling.service';
import {RawDataForecastService} from './raw-data-forecast.service';

@Module({
  providers: [
    RawDataBasicService,
    RawDataSchedulingService,
    RawDataForecastService,
  ],
  exports: [
    RawDataBasicService,
    RawDataSchedulingService,
    RawDataForecastService,
  ],
})
export class RawDataModule {}
