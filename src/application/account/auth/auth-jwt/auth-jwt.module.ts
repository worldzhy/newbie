import {Module} from '@nestjs/common';
import {APP_GUARD} from '@nestjs/core';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from './auth-jwt.strategy';
import {JwtAuthGuard} from './auth-jwt.guard';
import {AuthJwtService} from './auth-jwt.service';
import {AuthPasswordModule} from '../auth-password/auth-password.module';
import {AuthProfileModule} from '../auth-profile/auth-profile.module';
import {AuthUuidModule} from '../auth-uuid/auth-uuid.module';
import {AuthVerificationCodeModule} from '../auth-verification-code/auth-verification-code.module';
import {PrismaModule} from '../../../../toolkits/prisma/prisma.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {expiresIn: '60s'},
    }),
    AuthPasswordModule,
    AuthProfileModule,
    AuthUuidModule,
    AuthVerificationCodeModule,
    PrismaModule,
  ],
  providers: [
    AuthJwtService,
    JwtStrategy,
    {
      // Register the JwtAuthGuard as a global guard using the following construction (in any module)
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthJwtService],
})
export class AuthJwtModule {}
