import {APP_GUARD} from '@nestjs/core';
import {Module} from '@nestjs/common';
import {AuthPasswordModule} from './password/password.module';
import {AuthProfileModule} from './profile/profile.module';
import {AuthUuidModule} from './uuid/uuid.module';
import {AuthVerificationCodeModule} from './verification-code/verification-code.module';
import {AuthJwtModule} from './jwt/jwt.module';
import {GlobalAuthGuard} from './auth.guard';

@Module({
  imports: [
    AuthJwtModule,
    AuthPasswordModule,
    AuthProfileModule,
    AuthUuidModule,
    AuthVerificationCodeModule,
  ],
  providers: [
    {
      // Register the GlobalAuthGuard as a global guard using the following construction (in any module)
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
  ],
})
export class AuthModule {}
