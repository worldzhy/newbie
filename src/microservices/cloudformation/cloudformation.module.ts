import {Global, Module} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {AwsCloudFormationStackService} from './stack/stack.service';
import {AwsEnvironmentService} from './environment/environment.service';
import {AwsSecretKeyTokenService} from './token/secretkey-token.service';
import {AwsCloudformationService} from './cloudformation.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>(
          'microservices.cloudformation.token.secret'
        ),
      }),
    }),
  ],
  providers: [
    AwsCloudFormationStackService,
    AwsEnvironmentService,
    AwsSecretKeyTokenService,
    AwsCloudformationService,
  ],
  exports: [
    AwsCloudFormationStackService,
    AwsEnvironmentService,
    AwsCloudformationService,
  ],
})
export class AwsCloudformationModule {}
