import {Module} from '@nestjs/common';
import {UserRefreshTokenService} from './refreshToken.service';

@Module({
  providers: [UserRefreshTokenService],
  exports: [UserRefreshTokenService],
})
export class UserRefreshTokenModule {}
