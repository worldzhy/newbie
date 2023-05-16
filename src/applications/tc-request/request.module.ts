import {Module} from '@nestjs/common';
import {TcWorkflowModule} from './workflow/workflow.module';
import {TcConstantController} from './constant/constant.controller';
import {FileManagementController} from './fmgmt/fmgmt.controller';
import {TcPaymentController} from './payment/payment.controller';

@Module({
  imports: [TcWorkflowModule],
  controllers: [
    TcConstantController,
    FileManagementController,
    TcPaymentController,
  ],
})
export class TcRequestModule {}
