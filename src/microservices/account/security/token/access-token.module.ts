import {Global, Module} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {AccessTokenService} from './access-token.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>(
          'microservices.account.token.userAccess.secret'
        ),
        signOptions: {
          expiresIn: config.getOrThrow<string>(
            'microservices.account.token.userAccess.expiresIn'
          ),
        },
      }),
    }),
  ],
  providers: [AccessTokenService],
  exports: [AccessTokenService],
})
export class AccessTokenModule {}
