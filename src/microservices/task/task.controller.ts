import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Prisma, Task} from '@prisma/client';
import {getAwsSqsConfig} from 'src/toolkit/aws/sqs/sqs.config';
import {SqsService} from '../../toolkit/aws/sqs/sqs.service';
import {TaskService} from './task.service';

@ApiTags('[Microservice] Task')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  private taskService = new TaskService();
  private sqs = new SqsService();

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

  @Get('')
  async getTasks(): Promise<Task[]> {
    return await this.taskService.findMany({});
  }

  @Get(':taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    description: 'The id of the task.',
    example: 81,
  })
  async getTask(@Param('taskId') taskId: string): Promise<Task | null> {
    return await this.taskService.findUnique({
      where: {id: parseInt(taskId)},
    });
  }

  @Patch(':taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    description: 'The id of the task.',
    example: 81,
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

  @Delete(':taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    description: 'The id of the task.',
    example: 81,
  })
  async deleteTask(@Param('taskId') taskId: string): Promise<Task> {
    return await this.taskService.delete({
      where: {id: parseInt(taskId)},
    });
  }

  @Patch(':taskId/send2queue')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    description: 'The id of the task.',
    example: 81,
  })
  async send2queue(@Param('taskId') taskId: string): Promise<Task> {
    // [step 1] Get task.
    const task = await this.taskService.findUniqueOrThrow({
      where: {id: parseInt(taskId)},
    });

    // [step 2] Send queue message.
    const output = await this.sqs.sendMessage({
      queueUrl: getAwsSqsConfig().sqsTaskQueueUrl,
      body: task.payload as object,
    });

    // [step 3] Update task record.
    return await this.taskService.update({
      where: {id: parseInt(taskId)},
      data: {
        sqsMessageId: output.MessageId,
        sqsResponse: output as object,
      },
    });
  }

  /* End */
}
