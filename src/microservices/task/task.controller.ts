import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {TaskState, TaskType} from '@prisma/client';
import {TaskService} from './task.service';

@ApiTags('[Microservice] Task Management / Task')
@ApiBearerAuth()
@Controller('task-management')
export class TaskController {
  private taskService = new TaskService();

  /**
   * Get tasks by page number. The order is by task name.
   *
   * @param {number} page
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof TaskController
   */
  @Get('/tasks/pages/:page')
  @ApiParam({
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the task list. It must be a LARGER THAN 0 integer.',
    example: 1,
  })
  async getTasksByPage(
    @Param('page') page: number
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Guard statement.
    let p = page;
    if (typeof page === 'string') {
      // Actually 'page' is string because it comes from URL param.
      p = parseInt(page);
    }
    if (p < 1) {
      return {
        data: null,
        err: {message: "The 'page' must be a large than 0 integer."},
      };
    }

    // [step 2] Get tasks.
    const datapipes = await this.taskService.findMany({
      orderBy: {
        id: 'asc',
      },
      take: 10,
      skip: 10 * (p - 1),
    });
    return {
      data: datapipes,
      err: null,
    };
  }

  /**
   * Get task by id
   *
   * @param {number} taskId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof TaskController
   */
  @Get('/tasks/:taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    description: 'The uuid of the task.',
    example: '81',
  })
  async getTask(
    @Param('taskId') taskId: number
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.taskService.findUnique({
      where: {id: taskId},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get task failed.'},
      };
    }
  }

  /**
   * Send a task to queue.
   *
   * @param {{
   *   product: string;
   *   body: object;
   *   state: TaskState;
   *   sqsQueueUrl: string;
   * }} body
   * @returns
   * @memberof TaskController
   */
  @Post('/tasks')
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
    // [step 1] Check if the task name is existed.

    // [step 2] Create task.
    const result = await this.taskService.sendOne({
      type: body.type,
      payload: body.payload,
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Task sent failed.'},
      };
    }
  }

  /**
   * Cancel a task.
   *
   * @param {number} taskId
   * @param {{
   *   product?: string;
   *   body?: object;
   *   state?: TaskState;
   *   sqsQueueUrl?: string;
   * }} body
   * @returns
   * @memberof TaskController
   */
  @Post('/tasks/:taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  @ApiBody({
    description: 'Update task.',
    examples: {
      a: {
        summary: '1. Update state',
        value: {
          state: TaskState.CANCELED,
        },
      },
    },
  })
  async cancelTask(
    @Param('taskId') taskId: number,
    @Body()
    body: {
      state: TaskState;
    }
  ) {
    // [step 1] Guard statement.
    const {state} = body;

    // [step 2] Update task state.
    const result = await this.taskService.update({
      where: {id: taskId},
      data: {state},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Task updated failed.'},
      };
    }
  }

  /* End */
}
