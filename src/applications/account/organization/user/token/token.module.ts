import {Module} from '@nestjs/common';
import {UserTokenService} from './token.service';

@Module({
  providers: [UserTokenService],
  exports: [UserTokenService],
})
export class UserTokenModule {}
