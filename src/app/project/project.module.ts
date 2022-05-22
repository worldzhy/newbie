import {Module} from '@nestjs/common';
import {ProjectController} from './project.controller';
import {ProjectService} from './project.service';
import {PrismaModule} from '../../_prisma/_prisma.module';
import {MicroserviceModule} from '../microservice/microservice.module';

@Module({
  imports: [PrismaModule, MicroserviceModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
