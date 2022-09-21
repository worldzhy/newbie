import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Prisma, Task, TaskType} from '@prisma/client';
import {TaskService} from './task.service';

@ApiTags('[Microservice] Task')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  private taskService = new TaskService();

  //* Create
  @Post('')
  @ApiBody({
    description: 'Create a task.',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          websites: {facebook: 'https://www.facebook.com/grace'},
          picture:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/800px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
        },
      },
    },
  })
  async createTask(
    @Body() body: Prisma.TaskUncheckedCreateInput
  ): Promise<Task> {
    return await this.taskService.create({data: body});
  }

  //* Get many
  @Get('')
  @ApiParam({
    name: 'type',
    schema: {type: 'string'},
    description:
      'The page of the task list. It must be a LARGER THAN 0 integer.',
    example: TaskType.DATATRANS_BATCH_PROCESSING,
  })
  async getTasks(
    @Query() query: {type?: TaskType; page?: string}
  ): Promise<Task[]> {
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
        throw new BadRequestException('The page must be larger than 0.');
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

  //* Get
  @Get(':taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'string'},
    description: 'The uuid of the task.',
    example: '81',
  })
  async getTask(@Param('taskId') taskId: string): Promise<Task | null> {
    return await this.taskService.findUnique({
      where: {id: parseInt(taskId)},
    });
  }

  //* Update
  @Patch(':taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'string'},
    description: 'The id of the task.',
    example: '81',
  })
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() body: Prisma.TaskUpdateInput
  ): Promise<Task> {
    return await this.taskService.update({
      where: {id: parseInt(taskId)},
      data: body,
    });
  }

  //* Delete
  @Delete(':taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'string'},
    description: 'The id of the task.',
    example: '81',
  })
  async deleteTask(@Param('taskId') taskId: string): Promise<Task> {
    return await this.taskService.delete({
      where: {id: parseInt(taskId)},
    });
  }

  /* End */
}
