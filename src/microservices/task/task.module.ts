import {Module} from '@nestjs/common';
import {AwsModule} from '../../toolkits/aws/aws.module';
import {PrismaModule} from '../../toolkits/prisma/prisma.module';
import {TaskController} from './task.controller';
import {TaskService} from './task.service';

@Module({
  imports: [PrismaModule, AwsModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
