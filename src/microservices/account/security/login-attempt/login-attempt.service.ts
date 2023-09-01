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
export class SecurityLoginIpAttemptService extends LoginAttemptService {
  private points: number;
  private duration: number;

  constructor(private readonly configService: ConfigService) {
    super();
    this.points = this.configService.getOrThrow<number>(
      'microservice.account.security.ipLoginAttempt.points'
    );
    this.duration = this.configService.getOrThrow<number>(
      'microservice.account.security.ipLoginAttempt.durationSeconds'
    );
    this.limiter = new RateLimiterMemory({
      points: this.points,
      duration: this.duration,
    });
  }
}

@Injectable()
export class SecurityLoginUserAttemptService extends LoginAttemptService {
  private points: number;
  private duration: number;

  constructor(private readonly configService: ConfigService) {
    super();
    this.points = this.configService.getOrThrow<number>(
      'microservice.account.security.userLoginAttempt.points'
    );
    this.duration = this.configService.getOrThrow<number>(
      'microservice.account.security.userLoginAttempt.durationSeconds'
    );
    this.limiter = new RateLimiterMemory({
      points: this.points,
      duration: this.duration,
    });
  }
}
