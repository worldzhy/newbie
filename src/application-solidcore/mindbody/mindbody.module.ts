import {Global, Module} from '@nestjs/common';
import {MindbodyService} from './mindbody.service';
import {ScToMbService} from './scToMb.service';
import {RawDataModule} from '../raw-data/raw-data.module';

@Global()
@Module({
  imports: [RawDataModule],
  providers: [MindbodyService, ScToMbService],
  exports: [MindbodyService, ScToMbService],
})
export class MindbodyModule {}
