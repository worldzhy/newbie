import {Module} from '@nestjs/common';
import {TaskGroupController} from './task-group.controller';
import {TaskGroupService} from './task-group.service';
import {PrismaModule} from '../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TaskGroupController],
  providers: [TaskGroupService],
  exports: [TaskGroupService],
})
export class TaskGroupModule {}
