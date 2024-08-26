import {Module} from '@nestjs/common';

import {GroupController} from './groups.controller';
import {GroupsService} from './groups.service';

@Module({
  controllers: [GroupController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
