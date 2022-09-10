import {Module} from '@nestjs/common';
import {InfrastructureStackModule} from './infrastructure-stack/infrastructure-stack.module';
import {MicroserviceModule} from './microservice/microservice.module';
import {ProjectModule} from './project/project.module';

@Module({
  imports: [ProjectModule, InfrastructureStackModule, MicroserviceModule],
})
export class ProjectManagementModule {}
