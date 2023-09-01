import {Global, Module} from '@nestjs/common';
import {JwtStrategy} from './authentication/jwt/jwt.strategy';
import {AuthPasswordStrategy} from './authentication/password/password.strategy';
import {AuthProfileStrategy} from './authentication/profile/profile.strategy';
import {AuthUuidStrategy} from './authentication/uuid/uuid.strategy';
import {AuthVerificationCodeStrategy} from './authentication/verification-code/verification-code.strategy';
import {AuthRefreshStrategy} from './authentication/refresh/refresh.strategy';
import {OrganizationService} from './organization/organization.service';
import {PermissionService} from './permission/permission.service';
import {RoleService} from './role/role.service';
import {UserService} from './user/user.service';
import {UserProfileService} from './user/user-profile.service';
import {UserAccessTokenService} from './user/user-access-token.service';
import {UserRefreshTokenService} from './user/user-refresh-token.service';
import {
  SecurityLoginIpAttemptService,
  SecurityLoginUserAttemptService,
} from './security/login-attempt/login-attempt.service';
import {VerificationCodeService} from './verification-code/verification-code.service';
import {AccountService} from './account.service';

import {AuthenticationGuard} from './authentication/authentication.guard';
import {AuthorizationGuard} from './authorization/authorization.guard';
import {SecurityLoginIpAttemptGuard} from './security/login-attempt/login-attempt.guard';
import {SecurityGuard} from './security/security.guard';

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
    {provide: APP_GUARD, useClass: SecurityGuard}, // 2nd priority guard.
    {provide: APP_GUARD, useClass: AuthenticationGuard}, // 3rd priority guard.
    {provide: APP_GUARD, useClass: AuthorizationGuard}, // 4th priority guard.

    JwtStrategy,
    AuthPasswordStrategy,
    AuthProfileStrategy,
    AuthUuidStrategy,
    AuthVerificationCodeStrategy,
    AuthRefreshStrategy,
    SecurityLoginIpAttemptService,
    SecurityLoginUserAttemptService,
    SecurityLoginIpAttemptGuard,
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
