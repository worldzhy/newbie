import {Module} from '@nestjs/common';
import {CheckpointModule} from './checkpoint/checkpoint.module';
import {EnvironmentModule} from './environment/environment.module';
import {InfrastructureModule} from './infrastructure/infrastructure.module';
import {ProjectModule} from './project/project.module';

@Module({
  imports: [
    CheckpointModule,
    EnvironmentModule,
    InfrastructureModule,
    ProjectModule,
  ],
})
export class ProjectManagementModule {}
