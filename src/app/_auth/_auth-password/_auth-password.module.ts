import {Module} from '@nestjs/common';
import {UserModule} from '../../_user/_user.module';
import {AuthPasswordService} from './_auth-password.service';
import {AuthPasswordStrategy} from './_auth-password.strategy';

@Module({
  imports: [UserModule],
  providers: [AuthPasswordService, AuthPasswordStrategy],
  exports: [AuthPasswordService],
})
export class AuthPasswordModule {}
