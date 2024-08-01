import {Global, Module} from '@nestjs/common';
import {BullModule} from '@nestjs/bull';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('microservices.queue.redis.host'),
          port: configService.get('microservices.queue.redis.port'),
          password: configService.get('microservices.queue.redis.password'),
        },
      }),
    }),
  ],
})
export class NewbieQueueModule {}
