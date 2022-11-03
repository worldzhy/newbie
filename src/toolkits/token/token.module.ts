import {Module, Global} from '@nestjs/common';
import {TokenService} from './token.service';

@Global()
@Module({
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
