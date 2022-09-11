import {Controller, Get, Post, Param, Body, Delete} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {TaskGroupService} from './task-group.service';

@ApiTags('Tool / Task Management')
@ApiBearerAuth()
@Controller('task-group')
export class TaskGroupController {
  private taskGroupService = new TaskGroupService();

  /**
   * Get task groups by page number. The order is by task group name.
   *
   * @param {number} page
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof TaskGroupController
   */
  @Get('/pages/:page')
  @ApiParam({
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the task group list. It must be a LARGER THAN 0 integer.',
    example: 1,
  })
  async getTaskGroupsByPage(
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

    // [step 2] Get task groups.
    const datapipes = await this.taskGroupService.findMany({
      orderBy: {
        _relevance: {
          fields: ['name'],
          search: 'database',
          sort: 'asc',
        },
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
   * Get task group by id
   *
   * @param {string} taskGroupId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof TaskGroupController
   */
  @Get('/:taskGroupId')
  @ApiParam({
    name: 'taskGroupId',
    schema: {type: 'string'},
    description: 'The uuid of the task group.',
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async getTaskGroup(
    @Param('taskGroupId') taskGroupId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.taskGroupService.findOne({
      where: {id: taskGroupId},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get task group failed.'},
      };
    }
  }

  /**
   * Create a new task group.
   *
   * @param {{
   *   name: string;
   *   sqsQueueUrl: string;
   * }} body
   * @returns
   * @memberof TaskGroupController
   */
  @Post('/')
  @ApiBody({
    description: "The 'name' and 'sqsQueueUrl' are required in request body.",
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
  async createTaskGroup(
    @Body()
    body: {
      name: string;
      sqsQueueUrl: string;
    }
  ) {
    // [step 1] Check if the task group name is existed.
    if (!(await this.taskGroupService.checkExistence(body.name))) {
      return {
        data: null,
        err: {
          message: 'The task group name is existed.',
        },
      };
    }

    // [step 2] Create task group.
    const result = await this.taskGroupService.create({
      name: body.name,
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
        err: {message: 'TaskGroup create failed.'},
      };
    }
  }

  /**
   * Update task group
   *
   * @param {string} taskGroupId
   * @param {{name?: string; sqsQueueUrl?: string;}} body
   * @returns
   * @memberof TaskGroupController
   */
  @Post('/:taskGroupId')
  @ApiParam({
    name: 'taskGroupId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  @ApiBody({
    description: 'Update task group.',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          name: 'task-group-02',
          sqsQueueUrl:
            'https://sqs.cn-northwest-1.amazonaws.com.cn/077767357755/dev-inceptionpad-message-service-email-level1',
        },
      },
    },
  })
  async updateTaskGroup(
    @Param('taskGroupId') taskGroupId: string,
    @Body()
    body: {
      name?: string;
      sqsQueueUrl?: string;
    }
  ) {
    // [step 1] Guard statement.
    const {name, sqsQueueUrl} = body;

    // [step 2] Update name.
    const result = await this.taskGroupService.update({
      where: {id: taskGroupId},
      data: {name, sqsQueueUrl},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'TaskGroup updated failed.'},
      };
    }
  }

  /**
   * Delete task group
   * @param {string} taskGroupId
   * @returns
   * @memberof TaskGroupController
   */
  @Delete('/:taskGroupId')
  @ApiParam({
    name: 'taskGroupId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async deleteTaskGroup(@Param('taskGroupId') taskGroupId: string) {
    // [step 1] Guard statement.

    // [step 2] Delete task group.
    const result = await this.taskGroupService.delete({id: taskGroupId});
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'TaskGroup deleted failed.'},
      };
    }
  }

  /* End */
}
