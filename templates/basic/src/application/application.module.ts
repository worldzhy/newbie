import {Module} from '@nestjs/common';
import {FrameworkModule} from '@devbie/newbie';
import {PrismaClient} from '@generated/prisma/client';
import {ModulesModule} from '@modules/modules.module';
import {ApplicationController} from '@/application/application.controller';

@Module({
  imports: [FrameworkModule.forRoot({prisma: {PrismaClient}}), ModulesModule],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
