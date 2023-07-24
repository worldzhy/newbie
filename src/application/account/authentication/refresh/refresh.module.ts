import {Module} from '@nestjs/common';
import {UserModule} from '../../user/user.module';
import {TokenModule} from 'src/toolkit/token/token.module';
import {AuthRefreshStrategy} from './refresh.strategy';

@Module({
  imports: [UserModule, TokenModule],
  providers: [AuthRefreshStrategy],
})
export class AuthRefreshModule {}
