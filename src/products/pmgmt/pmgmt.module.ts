import {Module} from '@nestjs/common';
import {CheckpointModule} from './checkpoint/checkpoint.module';
import {EnvironmentModule} from './environment/environment.module';
import {InfrastructureStackModule} from './infrastructure-stack/infrastructure-stack.module';
import {ProjectModule} from './project/project.module';

@Module({
  imports: [
    CheckpointModule,
    EnvironmentModule,
    InfrastructureStackModule,
    ProjectModule,
  ],
})
export class ProjectManagementModule {}
