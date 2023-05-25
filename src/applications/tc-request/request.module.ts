import {Module} from '@nestjs/common';
import {TcWorkflowModule} from './workflow/workflow.module';
import {TcConstantController} from './constant/constant.controller';

@Module({
  imports: [TcWorkflowModule],
  controllers: [TcConstantController],
})
export class TcRequestModule {}
