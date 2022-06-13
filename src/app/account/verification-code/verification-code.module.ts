import {Module} from '@nestjs/common';
import {QueueModule} from '../../../_queue/_queue.module';
import {UserModule} from '../user/user.module';
import {VerificationCodeController} from './verification-code.controller';
import {VerificationCodeService} from './verification-code.service';

@Module({
  imports: [UserModule, QueueModule],
  controllers: [VerificationCodeController],
  providers: [VerificationCodeService],
  exports: [VerificationCodeService],
})
export class VerificationCodeModule {}
