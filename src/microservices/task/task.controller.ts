import {Controller, Get, Post, Param, Body, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Prisma, Task, TaskState, TaskType} from '@prisma/client';
import {TaskService} from './task.service';

@ApiTags('[Microservice] Task Management / Task')
@ApiBearerAuth()
@Controller('task-management')
export class TaskController {
  private taskService = new TaskService();

  @Post('tasks')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          type: TaskType.DATATRANS_BATCH_PROCESSING,
          payload: {name: 'Jim', age: 12},
        },
      },
    },
  })
  async sendTask(
    @Body()
    body: {
      type: TaskType;
      payload: object;
    }
  ) {
    return await this.taskService.sendOne({
      type: body.type,
      payload: body.payload,
    });
  }

  @Get('tasks')
  @ApiParam({
    name: 'type',
    schema: {type: 'string'},
    description:
      'The page of the task list. It must be a LARGER THAN 0 integer.',
    example: TaskType.DATATRANS_BATCH_PROCESSING,
  })
  async getTasks(
    @Query() query: {type?: TaskType; page?: string}
  ): Promise<Task[] | {err: {message: string}}> {
    // [step 1] Construct where argument.
    let where: Prisma.TaskWhereInput | undefined;
    if (query.type) {
      where = {type: query.type};
    }

    // [step 2] Construct take and skip arguments.
    let take: number, skip: number;
    if (query.page) {
      // Actually 'page' is string because it comes from URL param.
      const page = parseInt(query.page);
      if (page > 0) {
        take = 10;
        skip = 10 * (page - 1);
      } else {
        return {err: {message: 'The page must be larger than 0.'}};
      }
    } else {
      take = 10;
      skip = 0;
    }

    // [step 3] Get tasks.
    return await this.taskService.findMany({
      where: where,
      take: take,
      skip: skip,
    });
  }

  @Get('tasks/:taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    description: 'The uuid of the task.',
    example: '81',
  })
  async getTask(@Param('taskId') taskId: number): Promise<Task | null> {
    return await this.taskService.findUnique({
      where: {id: taskId},
    });
  }

  /**
   * Cancel a task.
   */
  @Post('tasks/:taskId/cancel')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async cancelTask(@Param('taskId') taskId: number) {
    return await this.taskService.update({
      where: {id: taskId},
      data: {state: TaskState.CANCELED},
    });
  }

  /* End */
}
