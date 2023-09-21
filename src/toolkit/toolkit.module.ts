import {Global, Module} from '@nestjs/common';
import {AwsModule} from './aws/aws.module';
import {ElasticModule} from './elastic/elastic.module';
import {CustomLoggerModule} from './logger/logger.module';
import {PrismaModule} from './prisma/prisma.module';
import {XLSXModule} from './xlsx/xlsx.module';

@Global()
@Module({
  imports: [
    AwsModule,
    ElasticModule,
    CustomLoggerModule,
    PrismaModule,
    XLSXModule,
  ],
  //   exports: [AwsModule, ElasticModule, PrismaModule, TokenModule, XLSXModule],
})
export class ToolkitModule {}
