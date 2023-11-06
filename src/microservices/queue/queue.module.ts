import {Global, Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {BullModule} from '@nestjs/bull';
import {ScheduleModule} from '@nestjs/schedule';
import {QueueTaskService} from './queue-task.service';
import {QueueName, QueueService} from './queue.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('server.redis.host'),
          port: configService.get('server.redis.port'),
          password: configService.get('server.redis.password'),
        },
      }),
    }),
    BullModule.registerQueue({name: QueueName.DEFAULT}),
    ScheduleModule.forRoot(),
  ],
  providers: [QueueTaskService, QueueService],
  exports: [QueueTaskService, QueueService],
})
export class QueueModule {}
