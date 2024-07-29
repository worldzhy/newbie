import {TimeoutTaskService} from '@microservices/task-scheduling/timeout/timeout.service';
import {Controller, Delete, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';

@ApiTags('Scheduling')
@ApiBearerAuth()
@Controller('task-scheduling')
export class SchedulingController {
  constructor(private readonly timeoutTaskService: TimeoutTaskService) {}

  @Get('timeout-tasks')
  listTimeoutTasks() {
    return this.timeoutTaskService.listTasks();
  }

  /* End */
}
