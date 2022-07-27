import {Injectable, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {AuthGuard} from '@nestjs/passport';
import {AuthPasswordGuard} from '../auth-password/auth-password.guard';
import {AuthProfileGuard} from '../auth-profile/auth-profile.guard';
import {AuthUuidGuard} from '../auth-uuid/auth-uuid.guard';
import {AuthVerificationCodeGuard} from '../auth-verification-code/auth-verification-code.guard';
import {IS_PUBLIC_KEY} from './auth-jwt.decorator';
import {IS_LOGGING_IN_PASSWORD_KEY} from '../auth-password/auth-password.decorator';
import {IS_LOGGING_IN_PROFILE_KEY} from '../auth-profile/auth-profile.decorator';
import {IS_LOGGING_IN_UUID_KEY} from '../auth-uuid/auth-uuid.decorator';
import {IS_LOGGING_IN_VERIFICATION_CODE_KEY} from '../auth-verification-code/auth-verification-code.decorator';

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

    // Use @LoggingInByPassword() for local.password strategy authentication
    const isLoggingInByPassword = this.reflector.getAllAndOverride<boolean>(
      IS_LOGGING_IN_PASSWORD_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (isLoggingInByPassword) {
      return new AuthPasswordGuard().canActivate(context);
    }

    // Use @LoggingInByProfile() for custom.profile strategy authentication
    const isLoggingInByProfile = this.reflector.getAllAndOverride<boolean>(
      IS_LOGGING_IN_PROFILE_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (isLoggingInByProfile) {
      return new AuthProfileGuard().canActivate(context);
    }

    // Use @LoggingInByUuid() for custom.uuid strategy authentication
    const isLoggingInByUuid = this.reflector.getAllAndOverride<boolean>(
      IS_LOGGING_IN_UUID_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (isLoggingInByUuid) {
      return new AuthUuidGuard().canActivate(context);
    }

    // Use @LoggingInByVerificationCode() for local.verification-code strategy authentication
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
