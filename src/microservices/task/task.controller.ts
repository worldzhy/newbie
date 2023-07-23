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
import {ConfigService} from '@nestjs/config';
import {Prisma, Task} from '@prisma/client';
import {TaskService} from './task.service';
import {SqsService} from '../../toolkit/aws/aws.sqs.service';

@ApiTags('[Microservice] Task')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly sqsService: SqsService,
    private readonly configService: ConfigService
  ) {}

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
  async getTask(@Param('taskId') taskId: number): Promise<Task | null> {
    return await this.taskService.findUnique({
      where: {id: taskId},
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
    @Param('taskId') taskId: number,
    @Body() body: Prisma.TaskUpdateInput
  ): Promise<Task> {
    return await this.taskService.update({
      where: {id: taskId},
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
  async deleteTask(@Param('taskId') taskId: number): Promise<Task> {
    return await this.taskService.delete({
      where: {id: taskId},
    });
  }

  @Patch(':taskId/send2queue')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    description: 'The id of the task.',
    example: 81,
  })
  async send2queue(@Param('taskId') taskId: number): Promise<Task> {
    // [step 1] Get task.
    const task = await this.taskService.findUniqueOrThrow({
      where: {id: taskId},
    });

    // [step 2] Send queue message.
    const output = await this.sqsService.sendMessage({
      queueUrl: this.configService.get<string>(
        'microservices.task.sqsQueueUrl'
      )!,
      body: task.payload as object,
    });

    // [step 3] Update task record.
    return await this.taskService.update({
      where: {id: taskId},
      data: {
        sqsMessageId: output.MessageId,
        sqsResponse: output as object,
      },
    });
  }

  /* End */
}
