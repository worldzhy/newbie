import {Global, Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {CacheModule} from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import {HttpModule} from '@nestjs/axios';
import {ElasticModule} from './elastic/elastic.module';
import {CustomLoggerModule} from './logger/logger.module';
import {PrismaModule} from './prisma/prisma.module';
import {SnowflakeModule} from './snowflake/snowflake.module';
import {XLSXModule} from './xlsx/xlsx.module';
import ToolkitConfiguration from './toolkit.config';
import {BullModule} from '@nestjs/bull';
import {NestJsModule} from './nestjs/nestjs.module';

@Global()
@Module({
  imports: getModules(),
  exports: [HttpModule],
})
export class ToolkitModule {}

function getModules() {
  const modules = [
    ConfigModule.forRoot({load: [ToolkitConfiguration], isGlobal: true}),
    CustomLoggerModule,
    ElasticModule,
    HttpModule,
    NestJsModule,
    PrismaModule,
    SnowflakeModule,
    XLSXModule,
  ];
  if (process.env.REDIS_HOST) {
    modules.push(
      CacheModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          store: redisStore,
          host: configService.get('toolkit.redis.host'),
          port: configService.get('toolkit.redis.port'),
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
            host: configService.get('toolkit.redis.host'),
            port: configService.get('toolkit.redis.port'),
            password: configService.get('toolkit.redis.password'),
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
