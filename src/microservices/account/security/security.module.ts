import {Module} from '@nestjs/common';
import {APP_GUARD} from '@nestjs/core';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';

import {AuthenticationGuard} from './authentication/authentication.guard';
import {AuthorizationGuard} from './authorization/authorization.guard';
import {LimitLoginByIpGuard} from './rate-limiter/rate-limiter-ip-login.guard';
import {LimitLoginByUserGuard} from './rate-limiter/rate-limiter-user-login.guard';

import {JwtStrategy} from './authentication/jwt/jwt.strategy';
import {PasswordAuthStrategy} from './authentication/password/password.strategy';
import {ProfileAuthStrategy} from './authentication/profile/profile.strategy';
import {RefreshTokenAuthStrategy} from './authentication/refresh-token/refresh-token.strategy';
import {UuidAuthStrategy} from './authentication/uuid/uuid.strategy';
import {VerificationCodeAuthStrategy} from './authentication/verification-code/verification-code.strategy';

import {
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
    {provide: APP_GUARD, useClass: LimitLoginByIpGuard}, // 2nd priority guard.
    {provide: APP_GUARD, useClass: LimitLoginByUserGuard}, // 3nd priority guard.
    {provide: APP_GUARD, useClass: AuthenticationGuard}, // 4rd priority guard.
    {provide: APP_GUARD, useClass: AuthorizationGuard}, // 5th priority guard.

    JwtStrategy,
    PasswordAuthStrategy,
    ProfileAuthStrategy,
    RefreshTokenAuthStrategy,
    UuidAuthStrategy,
    VerificationCodeAuthStrategy,

    LimitLoginByIpService,
    LimitLoginByUserService,
  ],
  exports: [LimitLoginByIpService, LimitLoginByUserService],
})
export class SecurityModule {}
