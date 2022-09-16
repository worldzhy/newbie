import {Module} from '@nestjs/common';
import {UserJwtService} from './jwt.service';

@Module({
  providers: [UserJwtService],
  exports: [UserJwtService],
})
export class UserJwtModule {}
