import {Injectable, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';
import {IS_LOGGING_IN} from './login-attempt/login-attempt.decorator';
import {SecurityLoginIpAttemptGuard} from './login-attempt/login-attempt.guard';

@Injectable()
export class SecurityGuard {
  private allowedOrigins: string[];

  constructor(
    private readonly configService: ConfigService,
    private readonly securityLoginIpAttemptGuard: SecurityLoginIpAttemptGuard,
    private reflector: Reflector
  ) {
    this.allowedOrigins = this.configService.getOrThrow<string[]>(
      'application.allowedOrigins'
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Allow only requests from allowed origins
    const origin = context.switchToHttp().getRequest().headers.origin;
    if (origin && !this.allowedOrigins.includes(origin)) {
      return false;
    }

    // Use @LoggingIn() for all login requests
    const isLoggingIn = this.reflector.getAllAndOverride<boolean>(
      IS_LOGGING_IN,
      [context.getHandler(), context.getClass()]
    );
    if (isLoggingIn) {
      const isIpAllowed = await this.securityLoginIpAttemptGuard.canActivate(
        context
      );
      if (!isIpAllowed) {
        return false;
      }
    }

    // Allow by default
    return true;
  }
}
