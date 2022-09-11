import {Controller, Get, Post, Param, Body, Delete} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {TaskState} from '@prisma/client';
import {TaskService} from './task.service';

@ApiTags('[Microservice] Task')
@ApiBearerAuth()
@Controller('task')
export class TaskController {
  private taskService = new TaskService();

  /**
   * Get tasks by page number. The order is by task name.
   *
   * @param {number} page
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof TaskController
   */
  @Get('/pages/:page')
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
  @Get('/:taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    description: 'The uuid of the task.',
    example: '81',
  })
  async getTask(
    @Param('taskId') taskId: number
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.taskService.findOne({
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
   * Create a new task.
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
  @Post('/')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'task-group-1',
          sqsQueueUrl:
            'https://sqs.cn-northwest-1.amazonaws.com.cn/077767357755/dev-inceptionpad-message-service-email-level1',
        },
      },
    },
  })
  async createTask(
    @Body()
    body: {
      payload: object;
      product: string;
      sqsQueueUrl: string;
    }
  ) {
    // [step 1] Check if the task name is existed.

    // [step 2] Create task.
    const result = await this.taskService.create({
      payload: body.payload,
      product: body.product,
      sqsQueueUrl: body.sqsQueueUrl,
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Task create failed.'},
      };
    }
  }

  /**
   * Update task
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
  @Post('/:taskId')
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
  async updateTask(
    @Param('taskId') taskId: number,
    @Body()
    body: {
      payload?: object;
      state?: TaskState;
      product?: string;
      sqsQueueUrl?: string;
    }
  ) {
    // [step 1] Guard statement.
    const {product, payload, state, sqsQueueUrl} = body;

    // [step 2] Update name.
    const result = await this.taskService.update({
      where: {id: taskId},
      data: {product, payload, state, sqsQueueUrl},
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

  /**
   * Delete task
   * @param {string} taskId
   * @returns
   * @memberof TaskController
   */
  @Delete('/:taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async deleteTask(@Param('taskId') taskId: number) {
    // [step 1] Guard statement.

    // [step 2] Delete task.
    const result = await this.taskService.delete({id: taskId});
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Task deleted failed.'},
      };
    }
  }

  /* End */
}
