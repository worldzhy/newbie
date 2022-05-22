import {Module} from '@nestjs/common';
import {APP_GUARD} from '@nestjs/core';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from './_auth-jwt.strategy';
import {JwtAuthGuard} from './_auth-jwt.guard';
import {AuthJwtService} from './_auth-jwt.service';
import {AuthPasswordModule} from '../_auth-password/_auth-password.module';
import {AuthVerificationCodeModule} from '../_auth-verification-code/_auth-verification-code.module';
import {PrismaModule} from '../../../_prisma/_prisma.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {expiresIn: '60s'},
    }),
    AuthPasswordModule,
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
