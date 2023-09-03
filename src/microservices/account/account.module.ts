import {Global, Module} from '@nestjs/common';
import {JwtStrategy} from './security/authentication/jwt/jwt.strategy';
import {AuthPasswordStrategy} from './security/authentication/password/password.strategy';
import {AuthProfileStrategy} from './security/authentication/profile/profile.strategy';
import {AuthUuidStrategy} from './security/authentication/uuid/uuid.strategy';
import {AuthVerificationCodeStrategy} from './security/authentication/verification-code/verification-code.strategy';
import {AuthRefreshStrategy} from './security/authentication/refresh/refresh.strategy';
import {OrganizationService} from './organization/organization.service';
import {PermissionService} from './permission/permission.service';
import {RoleService} from './role/role.service';
import {UserService} from './user/user.service';
import {UserProfileService} from './user/user-profile.service';
import {UserAccessTokenService} from './user/user-access-token.service';
import {UserRefreshTokenService} from './user/user-refresh-token.service';
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
import {APP_GUARD} from '@nestjs/core';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';

@Global()
@Module({
  imports: [
    NotificationModule,
    ThrottlerModule.forRoot({
      // Rate Limit (Maximum of 60 requests per 60 seconds)
      limit: 60,
      ttl: 60,
    }),
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
    OrganizationService,
    PermissionService,
    RoleService,
    UserProfileService,
    UserAccessTokenService,
    UserRefreshTokenService,
    UserService,
    VerificationCodeService,
    AccountService,
  ],
  exports: [
    OrganizationService,
    PermissionService,
    RoleService,
    UserProfileService,
    UserAccessTokenService,
    UserRefreshTokenService,
    UserService,
    VerificationCodeService,
    AccountService,
  ],
})
export class AccountModule {}
