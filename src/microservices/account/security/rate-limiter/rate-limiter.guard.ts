import {Injectable, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {UserService} from '../../user.service';
import {
  LimitAccessByIpService,
  LimitLoginByIpService,
  LimitLoginByUserService,
} from './rate-limiter.service';
import {
  LIMIT_ACCESS_BY_IP,
  LIMIT_LOGIN_BY_IP,
  LIMIT_LOGIN_BY_USER,
} from './rate-limiter.decorator';
import {
  NewbieException,
  NewbieExceptionStatus,
} from '@toolkit/nestjs/exception/newbie.exception';

@Injectable()
export class RateLimiterGuard {
  constructor(
    private readonly limitAccessByIpService: LimitAccessByIpService,
    private readonly limitLoginByIpService: LimitLoginByIpService,
    private readonly limitLoginByUserService: LimitLoginByUserService,
    private readonly userService: UserService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Rate limiter for accessing by counting ip visits.
    const limitAccessByIp = this.reflector.getAllAndOverride<boolean>(
      LIMIT_ACCESS_BY_IP,
      [context.getHandler(), context.getClass()]
    );
    if (limitAccessByIp) {
      const ipAddress = context.switchToHttp().getRequest()
        .socket.remoteAddress;
      const isAllowed = await this.limitAccessByIpService.isAllowed(ipAddress);

      if (isAllowed) {
        await this.limitAccessByIpService.increment(ipAddress);
      } else {
        throw new NewbieException(NewbieExceptionStatus.Access_HighFrequency);
      }
    }

    // Rate limiter for logging in by counting ip visits.
    const limitLoginByIp = this.reflector.getAllAndOverride<boolean>(
      LIMIT_LOGIN_BY_IP,
      [context.getHandler(), context.getClass()]
    );
    if (limitLoginByIp) {
      const ipAddress = context.switchToHttp().getRequest()
        .socket.remoteAddress;
      const isAllowed = await this.limitLoginByIpService.isAllowed(ipAddress);

      if (isAllowed) {
        await this.limitLoginByIpService.increment(ipAddress);
      } else {
        throw new NewbieException(NewbieExceptionStatus.Login_HighFrequency);
      }
    }

    // Rate limiter for logging in by counting user visits.
    const limitLoginByUser = this.reflector.getAllAndOverride<boolean>(
      LIMIT_LOGIN_BY_USER,
      [context.getHandler(), context.getClass()]
    );
    if (limitLoginByUser) {
      const {account} = context.switchToHttp().getRequest().body;
      const user = await this.userService.findByAccount(account);

      if (user) {
        const isAllowed = await this.limitLoginByUserService.isAllowed(user.id);

        if (isAllowed) {
          await this.limitLoginByUserService.increment(user.id);
        } else {
          throw new NewbieException(
            NewbieExceptionStatus.Login_ExceededAttempts
          );
        }
      }
    }

    return true;
  }
}
