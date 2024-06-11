import {Module, Global} from '@nestjs/common';
import {GoClickService} from './go-click.service';

@Global()
@Module({
  providers: [GoClickService],
  exports: [GoClickService],
})
export class GoClickModule {}
