import {Module} from '@nestjs/common';
import {InfrastructureStackModule} from './infrastructure-stack/infrastructure-stack.module';
import {ProjectModule} from './project/project.module';

@Module({
  imports: [ProjectModule, InfrastructureStackModule],
})
export class ProjectManagementModule {}
