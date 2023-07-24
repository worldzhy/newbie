import {Injectable, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {AuthGuard} from '@nestjs/passport';
import {JwtAuthGuard} from './jwt/jwt.guard';
import {AuthPasswordGuard} from './password/password.guard';
import {AuthProfileGuard} from './profile/profile.guard';
import {AuthUuidGuard} from './uuid/uuid.guard';
import {AuthVerificationCodeGuard} from './verification-code/verification-code.guard';
import {IS_PUBLIC_KEY} from './public/public.decorator';
import {IS_LOGGING_IN_PASSWORD_KEY} from './password/password.decorator';
import {IS_LOGGING_IN_PROFILE_KEY} from './profile/profile.decorator';
import {IS_LOGGING_IN_UUID_KEY} from './uuid/uuid.decorator';
import {IS_LOGGING_IN_VERIFICATION_CODE_KEY} from './verification-code/verification-code.decorator';
import {getConfig} from 'src/config';
import {IS_ACCESSING_REFRESH_ENDPOINT} from './refresh/refresh.decorator';
import {RefreshAuthGuard} from './refresh/refresh.guard';

@Injectable()
export class AuthenticationGuard extends AuthGuard('global-guard') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Allow only requests from allowed origins
    const origin = context.switchToHttp().getRequest().headers.origin;
    if (origin && !getConfig().allowedOrigins.includes(origin)) {
      return false;
    }

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

    // Use @AccessingRefreshEndpoint() for refresh endpoint authentication
    const isAccessingRefreshEndpoint =
      this.reflector.getAllAndOverride<boolean>(IS_ACCESSING_REFRESH_ENDPOINT, [
        context.getHandler(),
        context.getClass(),
      ]);
    if (isAccessingRefreshEndpoint) {
      return new RefreshAuthGuard().canActivate(context);
    }

    // JWT guard is the default guard.
    return new JwtAuthGuard().canActivate(context);
  }
}
