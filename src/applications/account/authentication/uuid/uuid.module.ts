import {Module} from '@nestjs/common';
import {UserModule} from '../../user/user.module';
import {AuthUuidStrategy} from './uuid.strategy';

@Module({
  imports: [UserModule],
  providers: [AuthUuidStrategy],
})
export class AuthUuidModule {}
