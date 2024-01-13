import {APP_GUARD} from '@nestjs/core';
import {Global, Module} from '@nestjs/common';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import {JwtStrategy} from './authentication/jwt/jwt.strategy';
import {AuthPasswordStrategy} from './authentication/password/password.strategy';
import {AuthProfileStrategy} from './authentication/profile/profile.strategy';
import {AuthUuidStrategy} from './authentication/uuid/uuid.strategy';
import {AuthVerificationCodeStrategy} from './authentication/verification-code/verification-code.strategy';
import {AuthRefreshStrategy} from './authentication/refresh/refresh.strategy';
import {
  LimitAccessByIpService,
  LimitLoginByIpService,
  LimitLoginByUserService,
} from './rate-limiter/rate-limiter.service';

import {AuthenticationGuard} from './authentication/authentication.guard';
import {AuthorizationGuard} from './authorization/authorization.guard';
import {LimitAccessByIpGuard} from './rate-limiter/rate-limiter-ip-access.guard';
import {LimitLoginByIpGuard} from './rate-limiter/rate-limiter-ip-login.guard';
import {LimitLoginByUserGuard} from './rate-limiter/rate-limiter-user-login.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      // Rate Limit (Maximum of 60 requests per 60 seconds)
      throttlers: [{limit: 60, ttl: 60}],
    }),
  ],
  providers: [
    // Guards
    {provide: APP_GUARD, useClass: ThrottlerGuard}, // 1st priority guard.
    {provide: APP_GUARD, useClass: LimitAccessByIpGuard}, // 2nd priority guard.
    {provide: APP_GUARD, useClass: LimitLoginByIpGuard}, // 3nd priority guard.
    {provide: APP_GUARD, useClass: LimitLoginByUserGuard}, // 4nd priority guard.
    {provide: APP_GUARD, useClass: AuthenticationGuard}, // 5rd priority guard.
    {provide: APP_GUARD, useClass: AuthorizationGuard}, // 6th priority guard.

    JwtStrategy,
    AuthPasswordStrategy,
    AuthProfileStrategy,
    AuthUuidStrategy,
    AuthVerificationCodeStrategy,
    AuthRefreshStrategy,
    LimitAccessByIpGuard,
    LimitLoginByIpGuard,
    LimitLoginByUserGuard,
    LimitAccessByIpService,
    LimitLoginByIpService,
    LimitLoginByUserService,
  ],
  exports: [
    LimitAccessByIpService,
    LimitLoginByIpService,
    LimitLoginByUserService,
  ],
})
export class SecurityModule {}
