import {Module} from '@nestjs/common';
import {TcWorkflowModule} from './workflow/workflow.module';
import {TcConstantController} from './constant/constant.controller';
import {FileManagementController} from './fmgmt/fmgmt.controller';

@Module({
  imports: [TcWorkflowModule],
  controllers: [TcConstantController, FileManagementController],
})
export class TcRequestModule {}
