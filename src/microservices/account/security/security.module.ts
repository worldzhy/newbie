import {Module} from '@nestjs/common';
import {APP_GUARD} from '@nestjs/core';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';

import {RateLimiterGuard} from './rate-limiter/rate-limiter.guard';
import {PassportGuard} from './passport/passport.guard';
import {AuthorizationGuard} from './authorization/authorization.guard';

import {NoAuthStrategy} from './passport/public/public.strategy';
import {JwtStrategy} from './passport/jwt/jwt.strategy';
import {PasswordAuthStrategy} from './passport/password/password.strategy';
import {ProfileAuthStrategy} from './passport/profile/profile.strategy';
import {RefreshTokenAuthStrategy} from './passport/refresh-token/refresh-token.strategy';
import {UuidAuthStrategy} from './passport/uuid/uuid.strategy';
import {VerificationCodeAuthStrategy} from './passport/verification-code/verification-code.strategy';

import {
  LimitAccessByIpService,
  LimitLoginByIpService,
  LimitLoginByUserService,
} from './rate-limiter/rate-limiter.service';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      // Maximum of 10000 requests / 1000 milliseconds for each endpoint.
      throttlers: [{limit: 10000, ttl: 1000}],
    }),
  ],
  providers: [
    {provide: APP_GUARD, useClass: ThrottlerGuard}, // 1st priority guard.
    {provide: APP_GUARD, useClass: RateLimiterGuard}, // 2nd priority guard.
    {provide: APP_GUARD, useClass: PassportGuard}, // 3rd priority guard.
    {provide: APP_GUARD, useClass: AuthorizationGuard}, // 4th priority guard.

    NoAuthStrategy,
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
