import {Module} from '@nestjs/common';
import {AuthModule} from './auth/auth.module';
import {UserModule} from './user/user.module';
import {VerificationCodeModule} from './verification-code/verification-code.module';
import {AccountController} from './account.controller';

@Module({
  imports: [AuthModule, UserModule, VerificationCodeModule],
  controllers: [AccountController],
})
export class AccountModule {}
