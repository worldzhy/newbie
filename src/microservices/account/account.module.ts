import {APP_GUARD} from '@nestjs/core';
import {Global, Module} from '@nestjs/common';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import {JwtStrategy} from './security/authentication/jwt/jwt.strategy';
import {AuthPasswordStrategy} from './security/authentication/password/password.strategy';
import {AuthProfileStrategy} from './security/authentication/profile/profile.strategy';
import {AuthUuidStrategy} from './security/authentication/uuid/uuid.strategy';
import {AuthVerificationCodeStrategy} from './security/authentication/verification-code/verification-code.strategy';
import {AuthRefreshStrategy} from './security/authentication/refresh/refresh.strategy';
import {RoleService} from './role/role.service';
import {UserService} from './user/user.service';
import {
  IpLoginLimiterService,
  UserLoginLimiterService,
} from './security/login-limiter/login-limiter.service';
import {VerificationCodeService} from './verification-code/verification-code.service';
import {AccountService} from './account.service';

import {AuthenticationGuard} from './security/authentication/authentication.guard';
import {AuthorizationGuard} from './security/authorization/authorization.guard';
import {IpLoginLimiterGuard} from './security/login-limiter/ip-login-limiter.guard';

import {NotificationModule} from '@microservices/notification/notification.module';
import {TokenModule} from '@microservices/token/token.module';

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot({
      // Rate Limit (Maximum of 60 requests per 60 seconds)
      throttlers: [
        {
          limit: 60,
          ttl: 60,
        },
      ],
    }),
    NotificationModule,
    TokenModule,
  ],
  providers: [
    // Guards
    {provide: APP_GUARD, useClass: ThrottlerGuard}, // 1st priority guard.
    {provide: APP_GUARD, useClass: IpLoginLimiterGuard}, // 2nd priority guard.
    {provide: APP_GUARD, useClass: AuthenticationGuard}, // 3rd priority guard.
    {provide: APP_GUARD, useClass: AuthorizationGuard}, // 4th priority guard.

    JwtStrategy,
    AuthPasswordStrategy,
    AuthProfileStrategy,
    AuthUuidStrategy,
    AuthVerificationCodeStrategy,
    AuthRefreshStrategy,
    IpLoginLimiterService,
    UserLoginLimiterService,
    IpLoginLimiterGuard,
    RoleService,
    UserService,
    VerificationCodeService,
    AccountService,
  ],
  exports: [RoleService, UserService, VerificationCodeService, AccountService],
})
export class AccountModule {}
