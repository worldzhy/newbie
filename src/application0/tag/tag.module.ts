import {Module} from '@nestjs/common';
import {TagController} from './tag.controller';
import {TagGroupController} from './tag-group.controller';

@Module({
  controllers: [TagController, TagGroupController],
})
export class App0TagModule {}
