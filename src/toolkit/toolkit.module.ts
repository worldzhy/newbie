import {Global, Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import ServerConfiguration from '@_config/server.config';
import MicroservicesConfiguration from '@_config/microservice.config';
import ToolkitConfiguration from '@_config/toolkit.config';
import {AwsModule} from './aws/aws.module';
import {ElasticModule} from './elastic/elastic.module';
import {CustomLoggerModule} from './logger/logger.module';
import {PrismaModule} from './prisma/prisma.module';
import {SnowflakeModule} from './snowflake/snowflake.module';
import {XLSXModule} from './xlsx/xlsx.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        ServerConfiguration,
        MicroservicesConfiguration,
        ToolkitConfiguration,
      ],
      isGlobal: true,
    }),
    AwsModule,
    ElasticModule,
    CustomLoggerModule,
    PrismaModule,
    SnowflakeModule,
    XLSXModule,
  ],
})
export class ToolkitModule {}
