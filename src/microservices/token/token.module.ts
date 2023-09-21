import {Module} from '@nestjs/common';
import {AccessTokenModule} from './access-token/access-token.module';
import {RefreshTokenModule} from './refresh-token/refresh-token.module';

@Module({
  imports: [AccessTokenModule, RefreshTokenModule],
})
export class TokenModule {}
