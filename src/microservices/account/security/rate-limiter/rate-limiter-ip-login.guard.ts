import {Injectable, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {LIMIT_LOGIN_BY_IP} from './rate-limiter.decorator';
import {LimitLoginByIpService} from './rate-limiter.service';

@Injectable()
export class LimitLoginByIpGuard {
  constructor(
    private readonly limitLoginByIpService: LimitLoginByIpService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const enableLimiter = this.reflector.getAllAndOverride<boolean>(
      LIMIT_LOGIN_BY_IP,
      [context.getHandler(), context.getClass()]
    );

    if (enableLimiter) {
      const ipAddress = context.switchToHttp().getRequest()
        .socket.remoteAddress;
      const isIpAllowed = await this.limitLoginByIpService.isAllowed(ipAddress);

      if (isIpAllowed) {
        await this.limitLoginByIpService.increment(ipAddress);
      } else {
        return false;
      }
    }

    return true;
  }
}
