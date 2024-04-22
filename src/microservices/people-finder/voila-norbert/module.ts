import {Module} from '@nestjs/common';
import {VoilaNorbertService} from './volia-norbert.service';

@Module({
  providers: [VoilaNorbertService],
  exports: [VoilaNorbertService],
})
export class VoilaNorbertModule {}
