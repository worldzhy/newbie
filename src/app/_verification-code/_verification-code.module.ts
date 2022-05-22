import {Module} from '@nestjs/common';
import {QueueModule} from '../../_queue/_queue.module';
import {UserModule} from '../_user/_user.module';
import {ValidatorModule} from '../../_validator/_validator.module';
import {VerificationCodeController} from './_verification-code.controller';
import {VerificationCodeService} from './_verification-code.service';

@Module({
  imports: [UserModule, ValidatorModule, QueueModule],
  controllers: [VerificationCodeController],
  providers: [VerificationCodeService],
  exports: [VerificationCodeService],
})
export class VerificationCodeModule {}
