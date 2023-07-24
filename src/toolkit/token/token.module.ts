import {Module, Global} from '@nestjs/common';
import {AccessTokenService, RefreshTokenService} from './token.service';

@Global()
@Module({
  providers: [AccessTokenService, RefreshTokenService],
  exports: [AccessTokenService, RefreshTokenService],
})
export class TokenModule {}
