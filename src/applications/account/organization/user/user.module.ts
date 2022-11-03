import {Module} from '@nestjs/common';
import {UserTokenModule} from './token/token.module';
import {UserProfileModule} from './profile/profile.module';
import {UserController} from './user.controller';
import {UserService} from './user.service';

@Module({
  imports: [UserTokenModule, UserProfileModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
