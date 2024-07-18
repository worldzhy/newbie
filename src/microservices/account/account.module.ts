import {Global, Module} from '@nestjs/common';

import {AccountController} from './account.controller';
import {LoginByPasswordController} from './login-by-password.controller';
import {LoginByProfileController} from './login-by-profile.controller';
import {LoginByVerificationCodeController} from './login-by-verificationcode.controller';
import {LoginRefreshController} from './login-refresh.controller';
import {LogoutController} from './logout.controller';
import {PasswordController} from './password.controller';
import {SignupController} from './signup.controller';
import {OrganizationController} from '../../microservices/account/organization/organization.controller';
import {PermissionController} from '../../microservices/account/permission/permission.controller';
import {RoleController} from '../../microservices/account/role/role.controller';
import {UserController} from '../../microservices/account/user/user.controller';
import {UserProfileController} from './user/user-profile.controller';

import {AccountService} from './account.service';
import {RoleService} from './role/role.service';
import {UserService} from './user/user.service';
import {VerificationCodeService} from './verification-code/verification-code.service';
import {VerificationCodeEmailService} from './verification-code/email.service';
import {VerificationCodeSmsService} from './verification-code/sms.service';
import {AwsPinpointService} from './verification-code/aws.pinpoint.service';
import {SecurityModule} from './security/security.module';

@Global()
@Module({
  imports: [SecurityModule],
  controllers: [
    AccountController,
    LoginByPasswordController,
    LoginByProfileController,
    LoginByVerificationCodeController,
    LoginRefreshController,
    LogoutController,
    PasswordController,
    SignupController,
    OrganizationController,
    PermissionController,
    RoleController,
    UserController,
    UserProfileController,
  ],
  providers: [
    AccountService,
    RoleService,
    UserService,
    VerificationCodeService,
    VerificationCodeEmailService,
    VerificationCodeSmsService,
    AwsPinpointService,
  ],
  exports: [AccountService, RoleService, UserService, VerificationCodeService],
})
export class AccountModule {}
