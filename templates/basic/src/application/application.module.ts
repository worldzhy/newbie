import {Module} from '@nestjs/common';
import {FrameworkModule} from '@devbie/newbie';
import {PrismaClient} from '@generated/prisma/client';
import {MicroservicesModule} from '@microservices/microservices.module';
import {ApplicationController} from '@/application/application.controller';

@Module({
  imports: [FrameworkModule.forRoot({prisma: {PrismaClient}}), MicroservicesModule],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
