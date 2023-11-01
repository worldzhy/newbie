import {Global, Module} from '@nestjs/common';
import {MindbodyService} from './mindbody.service';

@Global()
@Module({
  providers: [MindbodyService],
  exports: [MindbodyService],
})
export class MindbodyModule {}
