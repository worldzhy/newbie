import {Module} from '@nestjs/common';
import {AuthProfileStrategy} from './profile.strategy';

@Module({
  providers: [AuthProfileStrategy],
})
export class AuthProfileModule {}
