import {Module} from '@nestjs/common';
import {UserController} from './user.controller';
import {UserService} from './user.service';
import {LocationModule} from '../../../microservices/location/location.module';
import {UserProfileModule} from './profile/profile.module';
import {UserAccessTokenModule} from './accessToken/accessToken.module';
import {UserRefreshTokenModule} from './refreshToken/refreshToken.module';

@Module({
  imports: [
    LocationModule,
    UserProfileModule,
    UserAccessTokenModule,
    UserRefreshTokenModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
