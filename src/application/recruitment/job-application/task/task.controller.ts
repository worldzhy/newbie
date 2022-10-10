import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {JobApplicationTaskService} from './task.service';

import {
  JobApplicationTask,
  JobApplicationTaskState,
  Prisma,
} from '@prisma/client';
import {JobApplicationService} from '../job-application.service';

@ApiTags('[Application] Recruitment / Job Application / Task')
@ApiBearerAuth()
@Controller('recruitment-job-application-tasks')
export class JobApplicationTaskController {
  private jobApplicationTestService = new JobApplicationTaskService();
  private jobApplicationService = new JobApplicationService();

  //* Create
  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          reporterUserId: 'ababdab1-5d91-4af7-ab2b-e2c9744a88d4',
          reporterComment: 'This an example task.',
          assigneeUserId: 'ccabdab1-5d91-4af7-ab2b-e2c9744a88ss',
          jobApplicationId: 'ababdab1-5d91-4af7-ab2b-e2c9744a88d4',
        },
      },
    },
  })
  async createJobApplicationTask(
    @Body()
    body: Prisma.JobApplicationTaskUncheckedCreateInput
  ): Promise<JobApplicationTask> {
    // [step 1] Guard statement.
    if (
      !(await this.jobApplicationService.checkExistence(body.jobApplicationId))
    ) {
      throw new BadRequestException(
        'Invalid jobApplicationId in the request body.'
      );
    }

    // [step 2] Create jobApplicationTest.
    return await this.jobApplicationTestService.create({data: body});
  }

  //* Get many
  @Get('')
  async getJobApplicationTasks(): Promise<JobApplicationTask[]> {
    return await this.jobApplicationTestService.findMany({});
  }

  //* Get
  @Get(':taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplicationTest.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getJobApplicationTask(
    @Param('taskId') taskId: string
  ): Promise<JobApplicationTask | null> {
    return await this.jobApplicationTestService.findUnique({
      where: {id: parseInt(taskId)},
    });
  }

  //* Update
  @Patch(':taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplicationTest.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          state: JobApplicationTaskState.DONE,
        },
      },
    },
  })
  async updateJobApplicationTask(
    @Param('taskId') taskId: string,
    @Body() body: Prisma.JobApplicationTaskUpdateInput
  ): Promise<JobApplicationTask> {
    return await this.jobApplicationTestService.update({
      where: {id: parseInt(taskId)},
      data: body,
    });
  }

  //* Delete
  @Delete(':taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplicationTest.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteJobApplicationTask(
    @Param('taskId') taskId: string
  ): Promise<JobApplicationTask> {
    return await this.jobApplicationTestService.delete({
      where: {id: parseInt(taskId)},
    });
  }

  /* End */
}
