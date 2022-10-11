import {Module} from '@nestjs/common';
import {UserModule} from '../../user/user.module';
import {AuthProfileStrategy} from './profile.strategy';

@Module({
  imports: [UserModule],
  providers: [AuthProfileStrategy],
})
export class AuthProfileModule {}
