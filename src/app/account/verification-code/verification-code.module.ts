import {Module} from '@nestjs/common';
import {QueueModule} from '../../../_queue/_queue.module';
import {UserModule} from '../user/user.module';
import {ValidatorModule} from '../../../_validator/_validator.module';
import {VerificationCodeController} from './verification-code.controller';
import {VerificationCodeService} from './verification-code.service';

@Module({
  imports: [UserModule, ValidatorModule, QueueModule],
  controllers: [VerificationCodeController],
  providers: [VerificationCodeService],
  exports: [VerificationCodeService],
})
export class VerificationCodeModule {}
