import {Global, Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {AccessTokenService} from './access-token.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('toolkit.token.access.secret'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>(
            'toolkit.token.access.expiresIn'
          ),
        },
      }),
    }),
  ],
  providers: [AccessTokenService],
  exports: [AccessTokenService],
})
export class AccessTokenModule {}
