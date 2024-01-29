import {Module, Global} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';

// Microservice modules
import {AccessTokenModule, RefreshTokenModule} from '@worldzhy/newbie-pkg';

@Global()
@Module({
  imports: [
    AccessTokenModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>(
          'microservice.token.access.secret'
        ),
        signOptions: {
          expiresIn: configService.getOrThrow<string>(
            'microservice.token.access.expiresIn'
          ),
        },
      }),
    }),
    RefreshTokenModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>(
          'microservice.token.refresh.secret'
        ),
        signOptions: {
          expiresIn: configService.getOrThrow<string>(
            'microservice.token.refresh.expiresIn'
          ),
        },
      }),
    }),
  ],
  exports: [AccessTokenModule, RefreshTokenModule],
})
export class MicroserviceModule {}
