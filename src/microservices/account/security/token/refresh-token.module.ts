import {Global, Module} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {RefreshTokenService} from './refresh-token.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>(
          'microservices.account.token.userRefresh.secret'
        ),
        signOptions: {
          expiresIn: config.getOrThrow<string>(
            'microservices.account.token.userRefresh.expiresIn'
          ),
        },
      }),
    }),
  ],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
