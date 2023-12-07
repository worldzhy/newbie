import {Global, Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {CacheModule} from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import {HttpModule} from '@nestjs/axios';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {AwsModule} from './aws/aws.module';
import {ElasticModule} from './elastic/elastic.module';
import {CustomLoggerModule} from './logger/logger.module';
import {PrismaModule} from './prisma/prisma.module';
import {SnowflakeModule} from './snowflake/snowflake.module';
import {XLSXModule} from './xlsx/xlsx.module';
import ServerConfiguration from '@_config/server.config';
import MicroservicesConfiguration from '@_config/microservice.config';
import ToolkitConfiguration from '@_config/toolkit.config';

@Global()
@Module({
  imports: getModules(),
  exports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('server.httpTimeout'),
        maxRedirects: configService.get('server.httpMaxRedirects'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class ToolkitModule {}

function getModules() {
  const modules = [
    ConfigModule.forRoot({
      load: [
        ServerConfiguration,
        MicroservicesConfiguration,
        ToolkitConfiguration,
      ],
      isGlobal: true,
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('server.httpTimeout'),
        maxRedirects: configService.get('server.httpMaxRedirects'),
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    AwsModule,
    ElasticModule,
    CustomLoggerModule,
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
          host: configService.get('server.redis.host'),
          port: configService.get('server.redis.port'),
          ttl: configService.get('toolkit.cache.redis.ttl'), // cache-manamger v4 => seconds, v5 => milliseconds
        }),
        inject: [ConfigService],
        isGlobal: true,
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
