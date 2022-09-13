import {Module} from '@nestjs/common';
import {UserModule} from '../../user/user.module';
import {AuthProfileService} from './auth-profile.service';
import {AuthProfileStrategy} from './auth-profile.strategy';

@Module({
  imports: [UserModule],
  providers: [AuthProfileService, AuthProfileStrategy],
  exports: [AuthProfileService],
})
export class AuthProfileModule {}
