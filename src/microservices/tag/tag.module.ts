import {Global, Module} from '@nestjs/common';
import {TagService} from './tag.service';

@Global()
@Module({
  providers: [TagService],
  exports: [TagService],
})
export class TagModule {}
