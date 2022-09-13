import {Module} from '@nestjs/common';
import {AwsModule} from '../../_aws/_aws.module';
import {PrismaModule} from '../../_prisma/_prisma.module';
import {TaskController} from './task.controller';
import {TaskService} from './task.service';

@Module({
  imports: [PrismaModule, AwsModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
