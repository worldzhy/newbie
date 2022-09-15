import {Module} from '@nestjs/common';
import {UserModule} from '../../user/user.module';
import {AuthVerificationCodeService} from './auth-verification-code.service';
import {AuthVerificationCodeStrategy} from './auth-verification-code.strategy';

@Module({
  imports: [UserModule],
  providers: [AuthVerificationCodeService, AuthVerificationCodeStrategy],
  exports: [AuthVerificationCodeService],
})
export class AuthVerificationCodeModule {}
