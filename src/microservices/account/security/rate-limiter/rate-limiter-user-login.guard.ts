import {Injectable, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {LIMIT_LOGIN_BY_USER} from './rate-limiter.decorator';
import {LimitLoginByUserService} from './rate-limiter.service';
import {UserService} from '../../user.service';

@Injectable()
export class LimitLoginByUserGuard {
  constructor(
    private readonly limitLoginByUserService: LimitLoginByUserService,
    private readonly userService: UserService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const enableLimiter = this.reflector.getAllAndOverride<boolean>(
      LIMIT_LOGIN_BY_USER,
      [context.getHandler(), context.getClass()]
    );

    if (enableLimiter) {
      const {account} = context.switchToHttp().getRequest().body;
      const user = await this.userService.findByAccount(account);

      if (user) {
        const isIpAllowed = await this.limitLoginByUserService.isAllowed(
          user.id
        );

        if (isIpAllowed) {
          await this.limitLoginByUserService.increment(user.id);
        } else {
          return false;
        }
      }
    }

    return true;
  }
}
