import {Global, Module} from '@nestjs/common';
import {MindbodyService} from './mindbody.service';
import { ScToMbService } from './scToMb.service';

@Global()
@Module({
  providers: [MindbodyService, ScToMbService],
  exports: [MindbodyService, ScToMbService],
})
export class MindbodyModule {}
