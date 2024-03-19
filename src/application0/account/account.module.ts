import {Module} from '@nestjs/common';
import {AccountController} from './account.controller';
import {LoginByPasswordController} from './login-by-password.controller';
import {LoginByProfileController} from './login-by-profile.controller';
import {LoginByVerificationCodeController} from './login-by-verificationcode.controller';
import {LoginRefreshController} from './login-refresh.controller';
import {LogoutController} from './logout.controller';
import {SignupController} from './signup.controller';
import {OrganizationController} from './organization/organization.controller';
import {PermissionController} from './permission/permission.controller';
import {RoleController} from './role/role.controller';
import {UserController} from './user/user.controller';
import {ProfileController} from './user/profile.controller';

@Module({
  controllers: [
    AccountController,
    LoginByPasswordController,
    LoginByProfileController,
    LoginByVerificationCodeController,
    LoginRefreshController,
    LogoutController,
    SignupController,
    // OrganizationController,
    PermissionController,
    RoleController,
    UserController,
    ProfileController,
  ],
})
export class App0AccountModule {}
