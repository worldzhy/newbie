import {Global, Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {PrismaModule} from './prisma/prisma.module';
import ToolkitConfiguration from './toolkit.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({load: [ToolkitConfiguration], isGlobal: true}),
    PrismaModule,
  ],
})
export class ToolkitModule {}
