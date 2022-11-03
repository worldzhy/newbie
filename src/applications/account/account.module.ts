import {Module} from '@nestjs/common';
import {AccountController} from './account.controller';
import {AuthenticationModule} from './authentication/authentication.module';
import {AuthorizationModule} from './authorization/authorization.module';
import {OrganizationModule} from './organization/organization.module';

@Module({
  imports: [AuthenticationModule, AuthorizationModule, OrganizationModule],
  controllers: [AccountController],
})
export class AccountModule {}
