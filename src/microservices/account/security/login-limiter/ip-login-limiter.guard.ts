import {Injectable, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';
import {IS_LOGGING_IN} from './ip-login-limiter.decorator';
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

    // Use @LoggingIn() for all login requests
    const isLoggingIn = this.reflector.getAllAndOverride<boolean>(
      IS_LOGGING_IN,
      [context.getHandler(), context.getClass()]
    );
    if (isLoggingIn) {
      const isIpAllowed = await this.ipLoginLimiterService.isAllowed(ipAddress);

      if (!isIpAllowed) {
        return false;
      }
    }

    // Allow by default
    return true;
  }
}
