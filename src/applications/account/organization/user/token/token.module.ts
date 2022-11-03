import {Module} from '@nestjs/common';
import {UserTokenController} from './token.controller';
import {UserTokenService} from './token.service';

@Module({
  controllers: [UserTokenController],
  providers: [UserTokenService],
  exports: [UserTokenService],
})
export class UserTokenModule {}
