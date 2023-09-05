import {Global, Module} from '@nestjs/common';
import {TagService} from './tag.service';
import {TagGroupService} from './tag-group.service';

@Global()
@Module({
  providers: [TagService, TagGroupService],
  exports: [TagService, TagGroupService],
})
export class TagModule {}
