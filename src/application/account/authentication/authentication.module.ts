import {Module} from '@nestjs/common';
import {AuthPasswordModule} from './password/password.module';
import {AuthProfileModule} from './profile/profile.module';
import {AuthUuidModule} from './uuid/uuid.module';
import {AuthVerificationCodeModule} from './verification-code/verification-code.module';
import {AuthJwtModule} from './jwt/jwt.module';
import {AuthRefreshModule} from './refresh/refresh.module';

@Module({
  imports: [
    AuthJwtModule,
    AuthPasswordModule,
    AuthProfileModule,
    AuthUuidModule,
    AuthVerificationCodeModule,
    AuthRefreshModule,
  ],
})
export class AuthenticationModule {}
