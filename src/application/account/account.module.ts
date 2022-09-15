import {Module} from '@nestjs/common';
import {AccountService} from './account.service';
import {AccountController} from './account.controller';
import {AuthJwtModule} from './auth/auth-jwt/auth-jwt.module';
import {UserModule} from './user/user.module';
import {UserProfileModule} from './profile/profile.module';
import {VerificationCodeModule} from './verification-code/verification-code.module';
import {OrganizationModule} from './organization/organization.module';

@Module({
  imports: [
    AuthJwtModule,
    UserModule,
    UserProfileModule,
    VerificationCodeModule,
    OrganizationModule,
  ],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
