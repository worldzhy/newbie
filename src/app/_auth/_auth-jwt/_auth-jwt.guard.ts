import {Injectable, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {AuthGuard} from '@nestjs/passport';
import {AuthPasswordGuard} from '../_auth-password/_auth-password.guard';
import {AuthVerificationCodeGuard} from '../_auth-verification-code/_auth-verification-code.guard';
import {IS_PUBLIC_KEY} from './_auth-jwt.decorator';
import {IS_LOGGING_IN_PASSWORD_KEY} from '../_auth-password/_auth-password.decorator';
import {IS_LOGGING_IN_VERIFICATION_CODE_KEY} from '../_auth-verification-code/_auth-verification-code.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Use @Public() for non-authentication
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Use @LoggingInByPassword() for password-local strategy authentication
    const isLoggingInByPassword = this.reflector.getAllAndOverride<boolean>(
      IS_LOGGING_IN_PASSWORD_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (isLoggingInByPassword) {
      return new AuthPasswordGuard().canActivate(context);
    }

    // Use @LoggingInByVerificationCode() for password-local strategy authentication
    const isLoggingInByVerificationCode =
      this.reflector.getAllAndOverride<boolean>(
        IS_LOGGING_IN_VERIFICATION_CODE_KEY,
        [context.getHandler(), context.getClass()]
      );
    if (isLoggingInByVerificationCode) {
      return new AuthVerificationCodeGuard().canActivate(context);
    }

    // Global JWT authentication
    return super.canActivate(context);
  }
}
