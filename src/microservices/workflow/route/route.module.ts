import {Module} from '@nestjs/common';
import {WorkflowRouteController} from './route.controller';
import {WorkflowRouteService} from './route.service';

@Module({
  controllers: [WorkflowRouteController],
  providers: [WorkflowRouteService],
  exports: [WorkflowRouteService],
})
export class WorkflowRouteModule {}
