import {Injectable, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';
import {IP_ATTEMPTS_LIMITER} from './login-limiter-ip.decorator';
import {IpLoginLimiterService} from './login-limiter.service';

@Injectable()
export class IpLoginLimiterGuard {
  private allowedOrigins: string[];

  constructor(
    private readonly configService: ConfigService,
    private readonly ipLoginLimiterService: IpLoginLimiterService,
    private reflector: Reflector
  ) {
    this.allowedOrigins = this.configService.getOrThrow<string[]>(
      'server.allowedOrigins'
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Allow only requests from allowed origins
    const origin = context.switchToHttp().getRequest().headers.origin;
    const ipAddress = context.switchToHttp().getRequest().socket.remoteAddress;

    if (origin && !this.allowedOrigins.includes(origin)) {
      return false;
    }

    // Use @IpAttemptsLimiter() for all login requests
    const enableLimiter = this.reflector.getAllAndOverride<boolean>(
      IP_ATTEMPTS_LIMITER,
      [context.getHandler(), context.getClass()]
    );
    if (enableLimiter) {
      const isIpAllowed = await this.ipLoginLimiterService.isAllowed(ipAddress);

      if (!isIpAllowed) {
        return false;
      }
    }

    // Allow by default
    return true;
  }
}
