import {Module} from '@nestjs/common';
import {UserAccessTokenService} from './accessToken.service';

@Module({
  providers: [UserAccessTokenService],
  exports: [UserAccessTokenService],
})
export class UserAccessTokenModule {}
