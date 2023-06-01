import {Global, Module} from '@nestjs/common';
import {AwsModule} from './aws/aws.module';
import {ElasticModule} from './elastic/elastic.module';
import {PrismaModule} from './prisma/prisma.module';
import {TokenModule} from './token/token.module';
import {XLSXModule} from './xlsx/xlsx.module';

@Global()
@Module({
  imports: [AwsModule, ElasticModule, PrismaModule, TokenModule, XLSXModule],
  //   exports: [AwsModule, ElasticModule, PrismaModule, TokenModule, XLSXModule],
})
export class ToolkitModule {}
