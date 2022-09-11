import {Module} from '@nestjs/common';
import {AccountService} from './account.service';
import {AccountController} from './account.controller';
import {AuthJwtModule} from './auth/auth-jwt/auth-jwt.module';
import {UserModule} from './user/user.module';
import {ProfileModule} from './profile/profile.module';
import {VerificationCodeModule} from './verification-code/verification-code.module';

@Module({
  imports: [AuthJwtModule, UserModule, ProfileModule, VerificationCodeModule],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
