import {Module} from '@nestjs/common';
import {AccountController} from './account.controller';
import {AuthenticationModule} from './authentication/authentication.module';
import {AuthorizationModule} from './authorization/authorization.module';
import {OrganizationModule} from './organization/organization.module';
import {PermissionModule} from './permission/permission.module';
import {RoleModule} from './role/role.module';
import {UserModule} from './user/user.module';
import {VerificationCodeModule} from './verification-code/verification-code.module';

@Module({
  imports: [
    AuthenticationModule,
    AuthorizationModule,
    OrganizationModule,
    PermissionModule,
    RoleModule,
    UserModule,
    VerificationCodeModule,
  ],
  controllers: [AccountController],
})
export class AccountModule {}
