import {Global, Module} from '@nestjs/common';
import {ToolkitModule} from '@toolkit/toolkit.module';
import MicroservicesConfiguration from './microservices.config';
import {ConfigModule} from '@nestjs/config';
import {NotificationModule} from './notification/notification.module';
import {TaskSchedulingModule} from './task-scheduling/task-scheduling.module';

@Global()
@Module({
  imports: [
    ToolkitModule,
    ConfigModule.forRoot({load: [MicroservicesConfiguration], isGlobal: true}),
    NotificationModule,
    TaskSchedulingModule,
  ],
})
export class MicroservicesModule {}
