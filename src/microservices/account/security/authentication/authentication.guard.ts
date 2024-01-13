import {Injectable, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';
import {AuthGuard} from '@nestjs/passport';
import {JwtAuthGuard} from './jwt/jwt.guard';
import {PasswordAuthGuard} from './password/password.guard';
import {ProfileAuthGuard} from './profile/profile.guard';
import {RefreshTokenAuthGuard} from './refresh-token/refresh-token.guard';
import {UuidAuthGuard} from './uuid/uuid.guard';
import {VerificationCodeAuthGuard} from './verification-code/verification-code.guard';
import {IS_PUBLIC_KEY} from './public/public.decorator';
import {IS_LOGGING_IN_PASSWORD_KEY} from './password/password.decorator';
import {IS_LOGGING_IN_PROFILE_KEY} from './profile/profile.decorator';
import {IS_LOGGING_IN_UUID_KEY} from './uuid/uuid.decorator';
import {IS_LOGGING_IN_VERIFICATION_CODE_KEY} from './verification-code/verification-code.decorator';
import {IS_REFRESHING_ACCESS_TOKEN} from './refresh-token/refresh-token.decorator';

@Injectable()
export class AuthenticationGuard extends AuthGuard('global-guard') {
  private allowedOrigins: string[];

  constructor(
    private readonly configService: ConfigService,
    private reflector: Reflector
  ) {
    super();
    this.allowedOrigins = this.configService.getOrThrow<string[]>(
      'server.allowedOrigins'
    );
  }

  canActivate(context: ExecutionContext) {
    // Allow only requests from allowed origins
    const origin = context.switchToHttp().getRequest().headers.origin;
    if (origin && !this.allowedOrigins.includes(origin)) {
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
      return new PasswordAuthGuard().canActivate(context);
    }

    // Use @LoggingInByProfile() for custom.profile strategy authentication
    const isLoggingInByProfile = this.reflector.getAllAndOverride<boolean>(
      IS_LOGGING_IN_PROFILE_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (isLoggingInByProfile) {
      return new ProfileAuthGuard().canActivate(context);
    }

    // Use @LoggingInByUuid() for custom.uuid strategy authentication
    const isLoggingInByUuid = this.reflector.getAllAndOverride<boolean>(
      IS_LOGGING_IN_UUID_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (isLoggingInByUuid) {
      return new UuidAuthGuard().canActivate(context);
    }

    // Use @LoggingInByVerificationCode() for local.verification-code strategy authentication
    const isLoggingInByVerificationCode =
      this.reflector.getAllAndOverride<boolean>(
        IS_LOGGING_IN_VERIFICATION_CODE_KEY,
        [context.getHandler(), context.getClass()]
      );
    if (isLoggingInByVerificationCode) {
      return new VerificationCodeAuthGuard().canActivate(context);
    }

    // Use @RefreshingAccessToken() for refresh endpoint authentication
    const isRefreshingAccessToken = this.reflector.getAllAndOverride<boolean>(
      IS_REFRESHING_ACCESS_TOKEN,
      [context.getHandler(), context.getClass()]
    );
    if (isRefreshingAccessToken) {
      return new RefreshTokenAuthGuard().canActivate(context);
    }

    // JWT guard is the default guard.
    return new JwtAuthGuard().canActivate(context);
  }
}
