import {Module} from '@nestjs/common';
import {UserModule} from '../../../microservices/user/user.module';

@Module({
  imports: [UserModule],
})
export class AuthorizationModule {}
