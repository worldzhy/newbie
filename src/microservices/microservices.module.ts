import {Global, Module} from '@nestjs/common';
import {ToolkitModule} from '@toolkit/toolkit.module';
import MicroservicesConfiguration from './microservices.config';
import {ConfigModule} from '@nestjs/config';
import {AwsModule} from './aws/aws.module';

@Global()
@Module({
  imports: [
    ToolkitModule,
    ConfigModule.forRoot({load: [MicroservicesConfiguration], isGlobal: true}),
    AwsModule,
  ],
})
export class MicroservicesModule {}
