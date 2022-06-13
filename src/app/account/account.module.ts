import {Module} from '@nestjs/common';
import {AccountService} from './account.service';
import {AccountController} from './account.controller';
import {AuthJwtModule} from './auth/auth-jwt/auth-jwt.module';
import {UserModule} from './user/user.module';

@Module({
  imports: [UserModule, AuthJwtModule],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
