import {Global, Module} from '@nestjs/common';
import {MindbodyController} from './mindbody.controller';
import {MindbodyService} from './mindbody.service';
import {ScToMbService} from './scToMb.service';
import {RawDataModule} from '../raw-data/raw-data.module';

@Global()
@Module({
  imports: [RawDataModule],
  controllers: [MindbodyController],
  providers: [MindbodyService, ScToMbService],
  exports: [MindbodyService, ScToMbService],
})
export class MindbodyModule {}
