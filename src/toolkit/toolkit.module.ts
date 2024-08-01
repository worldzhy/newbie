import {Global, Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ElasticModule} from './elastic/elastic.module';
import {PrismaModule} from './prisma/prisma.module';
import {SnowflakeModule} from './snowflake/snowflake.module';
import ToolkitConfiguration from './toolkit.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({load: [ToolkitConfiguration], isGlobal: true}),
    ElasticModule,
    PrismaModule,
    SnowflakeModule,
  ],
})
export class ToolkitModule {}
