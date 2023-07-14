import {Module} from '@nestjs/common';
import {AccountService} from './account.service';
import {AccountForgotController} from './account-forgot.controller';
import {AccountLoginController} from './account-login.controller';
import {AccountLogoutController} from './account-logout.controller';
import {AccountSignupController} from './account-signup.controller';
import {AccountOthersController} from './account-others.controller';
import {AuthenticationModule} from './authentication/authentication.module';
import {AuthorizationModule} from './authorization/authorization.module';
import {OrganizationModule} from './organization/organization.module';
import {PermissionModule} from './permission/permission.module';
import {RoleModule} from './role/role.module';
import {UserModule} from './user/user.module';

@Module({
  imports: [
    AuthenticationModule,
    AuthorizationModule,
    OrganizationModule,
    PermissionModule,
    RoleModule,
    UserModule,
  ],
  controllers: [
    AccountForgotController,
    AccountLoginController,
    AccountLogoutController,
    AccountSignupController,
    AccountOthersController,
  ],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
