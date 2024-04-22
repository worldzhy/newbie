import {Global, Module} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {CloudFormationStackService} from './cloudformation/cloudformation.service';
import {AwsEnvironmentService} from './environment/environment.service';
import {AwsSecretKeyTokenService} from './token/secretkey-token.service';
import {AwsIaaSService} from './service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>(
          'microservice.token.awsSecretKey.secret'
        ),
      }),
    }),
  ],
  providers: [
    CloudFormationStackService,
    AwsEnvironmentService,
    AwsSecretKeyTokenService,
    AwsIaaSService,
  ],
  exports: [
    CloudFormationStackService,
    AwsEnvironmentService,
    AwsIaaSService,
  ],
})
export class AwsIaaSModule {}
