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
import {AccountService} from './account.service';
import {
  IpLoginAttemptService,
  UserLoginAttemptService,
} from './security/login-attempt/login-attempt.service';
import {SecurityIpLoginAttemptGuard} from './security/login-attempt/login-attempt.guard';

@Global()
@Module({
  providers: [
    JwtStrategy,
    AuthPasswordStrategy,
    AuthProfileStrategy,
    AuthUuidStrategy,
    AuthVerificationCodeStrategy,
    AuthRefreshStrategy,
    OrganizationService,
    PermissionService,
    RoleService,
    UserService,
    UserProfileService,
    UserAccessTokenService,
    UserRefreshTokenService,
    AccountService,
    SecurityIpLoginAttemptGuard,
    IpLoginAttemptService,
    UserLoginAttemptService,
  ],
  exports: [
    JwtStrategy,
    AuthPasswordStrategy,
    AuthProfileStrategy,
    AuthUuidStrategy,
    AuthVerificationCodeStrategy,
    AuthRefreshStrategy,
    OrganizationService,
    PermissionService,
    RoleService,
    UserService,
    UserProfileService,
    UserAccessTokenService,
    UserRefreshTokenService,
    AccountService,
    SecurityIpLoginAttemptGuard,
    IpLoginAttemptService,
    UserLoginAttemptService,
  ],
})
export class AccountModule {}
