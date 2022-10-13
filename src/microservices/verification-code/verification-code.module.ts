import {Module} from '@nestjs/common';
import {VerificationCodeService} from './verification-code.service';

@Module({
  providers: [VerificationCodeService],
  exports: [VerificationCodeService],
})
export class VerificationCodeModule {}
