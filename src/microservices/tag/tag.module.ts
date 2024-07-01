import {Global, Module} from '@nestjs/common';
import {TagController} from './tag.controller';
import {TagGroupController} from './tag-group.controller';

@Global()
@Module({controllers: [TagController, TagGroupController]})
export class TagModule {}
