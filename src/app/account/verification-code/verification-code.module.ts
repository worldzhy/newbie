import {Module} from '@nestjs/common';
import {MtracModule} from '../../mtrac/mtrac.module';
import {UserModule} from '../user/user.module';
import {VerificationCodeController} from './verification-code.controller';
import {VerificationCodeService} from './verification-code.service';

@Module({
  imports: [UserModule, MtracModule],
  controllers: [VerificationCodeController],
  providers: [VerificationCodeService],
  exports: [VerificationCodeService],
})
export class VerificationCodeModule {}
