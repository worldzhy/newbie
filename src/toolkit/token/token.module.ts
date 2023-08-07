import {Module, Global} from '@nestjs/common';
import {AccessTokenModule} from './access-token/access-token.module';
import {RefreshTokenModule} from './refresh-token/refresh-token.module';

@Global()
@Module({
  imports: [AccessTokenModule, RefreshTokenModule],
})
export class TokenModule {}
