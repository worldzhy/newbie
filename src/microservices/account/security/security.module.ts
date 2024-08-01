import {Module} from '@nestjs/common';
import {APP_GUARD} from '@nestjs/core';

import {RateLimiterGuard} from './rate-limiter/rate-limiter.guard';
import {PassportGuard} from './passport/passport.guard';
import {AuthorizationGuard} from './authorization/authorization.guard';

import {NoStrategy} from './passport/public/public.strategy';
import {JwtStrategy} from './passport/jwt/jwt.strategy';
import {PasswordStrategy} from './passport/password/password.strategy';
import {ProfileStrategy} from './passport/profile/profile.strategy';
import {RefreshTokenStrategy} from './passport/refresh-token/refresh-token.strategy';
import {UuidStrategy} from './passport/uuid/uuid.strategy';
import {VerificationCodeStrategy} from './passport/verification-code/verification-code.strategy';

import {
  LimitAccessByIpService,
  LimitLoginByIpService,
  LimitLoginByUserService,
} from './rate-limiter/rate-limiter.service';

import {AccessTokenModule} from './token/access-token.module';
import {RefreshTokenModule} from './token/refresh-token.module';
import {TokenModule} from './token/token.module';

@Module({
  imports: [AccessTokenModule, RefreshTokenModule, TokenModule],
  providers: [
    {provide: APP_GUARD, useClass: RateLimiterGuard}, // 2nd priority guard.
    {provide: APP_GUARD, useClass: PassportGuard}, // 3rd priority guard.
    {provide: APP_GUARD, useClass: AuthorizationGuard}, // 4th priority guard.

    NoStrategy,
    JwtStrategy,
    PasswordStrategy,
    ProfileStrategy,
    RefreshTokenStrategy,
    UuidStrategy,
    VerificationCodeStrategy,

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
