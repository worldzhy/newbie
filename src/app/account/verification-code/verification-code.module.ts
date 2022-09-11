import {Module} from '@nestjs/common';
import {NotificationModule} from '../../../microservice/notification/notification.module';
import {UserModule} from '../user/user.module';
import {VerificationCodeController} from './verification-code.controller';
import {VerificationCodeService} from './verification-code.service';

@Module({
  imports: [UserModule, NotificationModule],
  controllers: [VerificationCodeController],
  providers: [VerificationCodeService],
  exports: [VerificationCodeService],
})
export class VerificationCodeModule {}
