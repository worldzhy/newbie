import {Module} from '@nestjs/common';
import {TcWorkflowModule} from './workflow/workflow.module';

@Module({
  imports: [TcWorkflowModule],
})
export class TcRequestModule {}
