import {Module} from '@nestjs/common';
import {SnovService} from './snov.service';

@Module({
  providers: [SnovService],
  exports: [SnovService],
})
export class SnovModule {}
