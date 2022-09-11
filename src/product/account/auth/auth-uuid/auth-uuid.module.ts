import {Module} from '@nestjs/common';
import {UserModule} from '../../user/user.module';
import {AuthUuidService} from './auth-uuid.service';
import {AuthUuidStrategy} from './auth-uuid.strategy';

@Module({
  imports: [UserModule],
  providers: [AuthUuidService, AuthUuidStrategy],
  exports: [AuthUuidService],
})
export class AuthUuidModule {}
