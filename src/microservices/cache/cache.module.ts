import {Global, Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {CacheModule} from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import MicroservicesConfiguration from '../microservices.config';

@Global()
@Module({
  imports: getModules(),
})
export class NewbieCacheModule {}

function getModules() {
  const modules = [
    ConfigModule.forRoot({load: [MicroservicesConfiguration], isGlobal: true}),
  ];
  if (process.env.REDIS_HOST) {
    modules.push(
      CacheModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          store: redisStore,
          host: configService.get('microservices.cache.redis.host'),
          port: configService.get('microservices.cache.redis.port'),
          password: configService.get('microservices.cache.redis.password'),
          ttl: configService.get('microservices.cache.redis.ttl'), // cache-manamger v4 => seconds, v5 => milliseconds
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
          ttl: configService.get('microservices.cache.memory.ttl'), // cache-manamger v4 => seconds, v5 => milliseconds
          max: configService.get('microservices.cache.memory.max'),
        }),
        inject: [ConfigService],
        isGlobal: true,
      })
    );
  }
  return modules;
}
