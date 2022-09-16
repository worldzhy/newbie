import {Module} from '@nestjs/common';
import {AuthModule} from './auth/auth.module';
import {UserModule} from './user/user.module';
import {OrganizationModule} from './organization/organization.module';
import {VerificationCodeModule} from './verification-code/verification-code.module';

@Module({
  imports: [AuthModule, UserModule, OrganizationModule, VerificationCodeModule],
})
export class AccountModule {}
