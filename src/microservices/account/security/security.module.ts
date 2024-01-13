import {Module} from '@nestjs/common';
import {APP_GUARD} from '@nestjs/core';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';

import {AuthenticationGuard} from './authentication/authentication.guard';
import {AuthorizationGuard} from './authorization/authorization.guard';
import {LimitAccessByIpGuard} from './rate-limiter/rate-limiter-ip-access.guard';
import {LimitLoginByIpGuard} from './rate-limiter/rate-limiter-ip-login.guard';
import {LimitLoginByUserGuard} from './rate-limiter/rate-limiter-user-login.guard';

import {JwtStrategy} from './authentication/jwt/jwt.strategy';
import {PasswordAuthStrategy} from './authentication/password/password.strategy';
import {ProfileAuthStrategy} from './authentication/profile/profile.strategy';
import {RefreshTokenAuthStrategy} from './authentication/refresh-token/refresh-token.strategy';
import {UuidAuthStrategy} from './authentication/uuid/uuid.strategy';
import {VerificationCodeAuthStrategy} from './authentication/verification-code/verification-code.strategy';

import {
  LimitAccessByIpService,
  LimitLoginByIpService,
  LimitLoginByUserService,
} from './rate-limiter/rate-limiter.service';

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
    PasswordAuthStrategy,
    ProfileAuthStrategy,
    RefreshTokenAuthStrategy,
    UuidAuthStrategy,
    VerificationCodeAuthStrategy,

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
