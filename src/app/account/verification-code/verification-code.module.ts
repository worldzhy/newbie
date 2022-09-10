import {Module} from '@nestjs/common';
import {MessageTrackerModule} from '../../mtrac/mtrac.module';
import {UserModule} from '../user/user.module';
import {VerificationCodeController} from './verification-code.controller';
import {VerificationCodeService} from './verification-code.service';

@Module({
  imports: [UserModule, MessageTrackerModule],
  controllers: [VerificationCodeController],
  providers: [VerificationCodeService],
  exports: [VerificationCodeService],
})
export class VerificationCodeModule {}
