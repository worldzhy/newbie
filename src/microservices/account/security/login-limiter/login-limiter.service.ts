import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {RateLimiterMemory} from 'rate-limiter-flexible';

abstract class LoginLimiterService {
  protected limiter: RateLimiterMemory;

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
export class IpLoginLimiterService extends LoginLimiterService {
  private points: number;
  private duration: number;

  constructor(private readonly configService: ConfigService) {
    super();
    this.points = this.configService.getOrThrow<number>(
      'microservice.account.security.ipLoginLimiter.points'
    );
    this.duration = this.configService.getOrThrow<number>(
      'microservice.account.security.ipLoginLimiter.durationSeconds'
    );
    this.limiter = new RateLimiterMemory({
      points: this.points,
      duration: this.duration,
    });
  }
}

@Injectable()
export class UserLoginLimiterService extends LoginLimiterService {
  private points: number;
  private duration: number;

  constructor(private readonly configService: ConfigService) {
    super();
    this.points = this.configService.getOrThrow<number>(
      'microservice.account.security.userLoginLimiter.points'
    );
    this.duration = this.configService.getOrThrow<number>(
      'microservice.account.security.userLoginLimiter.durationSeconds'
    );
    this.limiter = new RateLimiterMemory({
      points: this.points,
      duration: this.duration,
    });
  }
}
