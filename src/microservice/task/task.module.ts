import {Module} from '@nestjs/common';
import {TaskController} from './task.controller';
import {TaskService} from './task.service';
import {PrismaModule} from '../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
