import {Module} from '@nestjs/common';
import {NotificationModule} from '../../../microservices/notification/notification.module';
import {VerificationCodeService} from './verification-code.service';

@Module({
  imports: [NotificationModule],
  providers: [VerificationCodeService],
  exports: [VerificationCodeService],
})
export class VerificationCodeModule {}
