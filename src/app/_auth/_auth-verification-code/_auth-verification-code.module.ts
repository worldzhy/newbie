import {Module} from '@nestjs/common';
import {UserModule} from '../../_user/_user.module';
import {AuthVerificationCodeService} from './_auth-verification-code.service';
import {AuthVerificationCodeStrategy} from './_auth-verification-code.strategy';

@Module({
  imports: [UserModule],
  providers: [AuthVerificationCodeService, AuthVerificationCodeStrategy],
  exports: [AuthVerificationCodeService],
})
export class AuthVerificationCodeModule {}
