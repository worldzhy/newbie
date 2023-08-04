import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {RateLimiterMemory} from 'rate-limiter-flexible';

abstract class LoginAttemptService {
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
export class IpLoginAttemptService extends LoginAttemptService {
  private points: number;
  private duration: number;

  constructor(private readonly configService: ConfigService) {
    super();
    this.points = this.configService.getOrThrow<number>(
      'microservice.security.ipLoginAttempt.points'
    );
    this.duration = this.configService.getOrThrow<number>(
      'microservice.security.ipLoginAttempt.durationSeconds'
    );
    this.limiter = new RateLimiterMemory({
      points: this.points,
      duration: this.duration,
    });
  }
}

@Injectable()
export class UserLoginAttemptService extends LoginAttemptService {
  private points: number;
  private duration: number;

  constructor(private readonly configService: ConfigService) {
    super();
    this.points = this.configService.getOrThrow<number>(
      'microservice.security.userLoginAttempt.points'
    );
    this.duration = this.configService.getOrThrow<number>(
      'microservice.security.userLoginAttempt.durationSeconds'
    );
    this.limiter = new RateLimiterMemory({
      points: this.points,
      duration: this.duration,
    });
  }
}
