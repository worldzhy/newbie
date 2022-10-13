import {Module} from '@nestjs/common';
import {UserJwtModule} from './jwt/jwt.module';
import {UserProfileModule} from './profile/profile.module';
import {UserController} from './user.controller';
import {UserService} from './user.service';

@Module({
  imports: [UserJwtModule, UserProfileModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
