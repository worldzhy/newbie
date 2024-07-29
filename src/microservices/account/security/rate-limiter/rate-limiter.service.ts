import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {RateLimiterMemory, RateLimiterRedis} from 'rate-limiter-flexible';
import {Redis} from 'ioredis';

enum LimiterType {
  IP_ACCESS = 'ip-access',
  IP_LOGIN = 'ip-login',
  USER_LOGIN = 'user-login',
}

abstract class RateLimiterService {
  private limiter: RateLimiterMemory | RateLimiterRedis;
  private points: number;
  private duration: number;

  constructor(
    private readonly config: ConfigService,
    limiterType: LimiterType
  ) {
    switch (limiterType) {
      case LimiterType.IP_ACCESS:
        this.points = this.config.getOrThrow<number>(
          'microservices.account.ratelimiter.ipAccessLimiter.points'
        );
        this.duration = this.config.getOrThrow<number>(
          'microservices.account.ratelimiter.ipAccessLimiter.durationSeconds'
        );
        break;
      case LimiterType.IP_LOGIN:
        this.points = this.config.getOrThrow<number>(
          'microservices.account.ratelimiter.ipLoginLimiter.points'
        );
        this.duration = this.config.getOrThrow<number>(
          'microservices.account.ratelimiter.ipLoginLimiter.durationSeconds'
        );
        break;
      case LimiterType.USER_LOGIN:
        this.points = this.config.getOrThrow<number>(
          'microservices.account.ratelimiter.userLoginLimiter.points'
        );
        this.duration = this.config.getOrThrow<number>(
          'microservices.account.ratelimiter.userLoginLimiter.durationSeconds'
        );
        break;
    }

    const redisHost = this.config.get<string>(
      'microservices.account.redis.host'
    );
    const redisPort = this.config.get<number>(
      'microservices.account.redis.port'
    );
    if (redisHost && redisPort) {
      this.limiter = new RateLimiterRedis({
        storeClient: new Redis({
          host: redisHost,
          port: redisPort,
          keyPrefix: limiterType + '-',
        }),
        points: this.points,
        duration: this.duration,
      });
    } else {
      this.limiter = new RateLimiterMemory({
        points: this.points,
        duration: this.duration,
      });
    }
  }

  async isAllowed(key: string): Promise<boolean> {
    const res = await this.limiter.get(key);
    // If there are no previous attempts, allow. Otherwise, check if there are remaining points.
    return !res ? true : res.remainingPoints > 0;
  }

  async increment(key: string): Promise<void> {
    await this.limiter.consume(key);
  }

  async delete(key: string): Promise<void> {
    await this.limiter.delete(key);
  }
}

@Injectable()
export class LimitAccessByIpService extends RateLimiterService {
  constructor(private readonly configService: ConfigService) {
    super(configService, LimiterType.IP_ACCESS);
  }
}

@Injectable()
export class LimitLoginByIpService extends RateLimiterService {
  constructor(private readonly configService: ConfigService) {
    super(configService, LimiterType.IP_LOGIN);
  }
}

@Injectable()
export class LimitLoginByUserService extends RateLimiterService {
  constructor(private readonly configService: ConfigService) {
    super(configService, LimiterType.USER_LOGIN);
  }
}
