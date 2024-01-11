import {Injectable, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {LIMIT_ACCESS_BY_IP} from './rate-limiter.decorator';
import {LimitAccessByIpService} from './rate-limiter.service';

@Injectable()
export class LimitAccessByIpGuard {
  constructor(
    private readonly limitAccessByIpService: LimitAccessByIpService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const enableLimiter = this.reflector.getAllAndOverride<boolean>(
      LIMIT_ACCESS_BY_IP,
      [context.getHandler(), context.getClass()]
    );

    if (enableLimiter) {
      const ipAddress = context.switchToHttp().getRequest()
        .socket.remoteAddress;
      const isIpAllowed =
        await this.limitAccessByIpService.isAllowed(ipAddress);

      if (isIpAllowed) {
        await this.limitAccessByIpService.increment(ipAddress);
      } else {
        return false;
      }
    }

    return true;
  }
}
