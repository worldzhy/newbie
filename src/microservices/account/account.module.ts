import {Global, Module} from '@nestjs/common';

import {AccountService} from './account.service';
import {RoleService} from './role.service';
import {UserService} from './user.service';
import {VerificationCodeService} from './verification-code.service';
import {SecurityModule} from './security/security.module';

@Global()
@Module({
  imports: [SecurityModule],
  providers: [
    AccountService,
    RoleService,
    UserService,
    VerificationCodeService,
  ],
  exports: [AccountService, RoleService, UserService, VerificationCodeService],
})
export class AccountModule {}
