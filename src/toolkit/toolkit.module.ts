import {Global, Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {BullModule} from '@nestjs/bull';
import {CacheModule} from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import {ElasticModule} from './elastic/elastic.module';
import {CustomLoggerModule} from './logger/logger.module';
import {PrismaModule} from './prisma/prisma.module';
import {SnowflakeModule} from './snowflake/snowflake.module';
import ToolkitConfiguration from './toolkit.config';

@Global()
@Module({
  imports: getModules(),
})
export class ToolkitModule {}

function getModules() {
  const modules = [
    ConfigModule.forRoot({load: [ToolkitConfiguration], isGlobal: true}),
    CustomLoggerModule,
    ElasticModule,
    PrismaModule,
    SnowflakeModule,
  ];
  if (process.env.REDIS_HOST) {
    modules.push(
      CacheModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          store: redisStore,
          host: configService.get('toolkit.cache.redis.host'),
          port: configService.get('toolkit.cache.redis.port'),
          password: configService.get('toolkit.cache.redis.password'),
          ttl: configService.get('toolkit.cache.redis.ttl'), // cache-manamger v4 => seconds, v5 => milliseconds
        }),
        inject: [ConfigService],
        isGlobal: true,
      })
    );
    modules.push(
      BullModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          redis: {
            host: configService.get('toolkit.bull.redis.host'),
            port: configService.get('toolkit.bull.redis.port'),
            password: configService.get('toolkit.bull.redis.password'),
          },
        }),
      })
    );
  } else {
    modules.push(
      CacheModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          ttl: configService.get('toolkit.cache.memory.ttl'), // cache-manamger v4 => seconds, v5 => milliseconds
          max: configService.get('toolkit.cache.memory.max'),
        }),
        inject: [ConfigService],
        isGlobal: true,
      })
    );
  }
  return modules;
}
