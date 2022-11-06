import {Module} from '@nestjs/common';
import {AccountController} from './account.controller';
import {AuthenticationModule} from './authentication/authentication.module';
import {AuthorizationModule} from './authorization/authorization.module';
import {UserModule} from './user/user.module';

@Module({
  imports: [AuthenticationModule, AuthorizationModule, UserModule],
  controllers: [AccountController],
})
export class AccountModule {}
