import {Global, Module} from '@nestjs/common';
import {ToolkitModule} from '@toolkit/toolkit.module';
import MicroservicesConfiguration from './microservices.config';
import {ConfigModule} from '@nestjs/config';
import {AwsCloudformationModule} from './cloudformation/cloudformation.module';

@Global()
@Module({
  imports: [
    ToolkitModule,
    ConfigModule.forRoot({load: [MicroservicesConfiguration], isGlobal: true}),
    AwsCloudformationModule,
  ],
})
export class MicroservicesModule {}
