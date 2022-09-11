import {Module} from '@nestjs/common';
import {UserModule} from '../../user/user.module';
import {AuthPasswordService} from './auth-password.service';
import {AuthPasswordStrategy} from './auth-password.strategy';

@Module({
  imports: [UserModule],
  providers: [AuthPasswordService, AuthPasswordStrategy],
  exports: [AuthPasswordService],
})
export class AuthPasswordModule {}
