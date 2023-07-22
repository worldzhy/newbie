import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {UserModule} from '../../../microservices/user/user.module';
import {JwtStrategy} from './jwt/jwt.strategy';
import {AuthPasswordStrategy} from './password/password.strategy';
import {AuthProfileStrategy} from './profile/profile.strategy';
import {AuthUuidStrategy} from './uuid/uuid.strategy';
import {AuthVerificationCodeStrategy} from './verification-code/verification-code.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {expiresIn: '1h'},
    }),
    UserModule,
  ],
  providers: [
    JwtStrategy,
    AuthPasswordStrategy,
    AuthProfileStrategy,
    AuthUuidStrategy,
    AuthVerificationCodeStrategy,
  ],
})
export class AuthenticationModule {}
