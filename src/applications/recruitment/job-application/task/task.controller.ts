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
  PermissionAction,
  PermissionResource,
  Prisma,
} from '@prisma/client';
import {JobApplicationService} from '../job-application.service';
import {RequirePermission} from '../../../account/authorization/authorization.decorator';

@ApiTags('[Application] Recruitment / Job Application / Task')
@ApiBearerAuth()
@Controller('recruitment-job-application-tasks')
export class JobApplicationTaskController {
  private jobApplicationTestService = new JobApplicationTaskService();
  private jobApplicationService = new JobApplicationService();

  //* Create
  @Post('')
  @RequirePermission(
    PermissionResource.JobApplicationTask,
    PermissionAction.CREATE
  )
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
  @RequirePermission(
    PermissionResource.JobApplicationTask,
    PermissionAction.SELECT
  )
  async getJobApplicationTasks(): Promise<JobApplicationTask[]> {
    return await this.jobApplicationTestService.findMany({});
  }

  //* Get
  @Get(':taskId')
  @RequirePermission(
    PermissionResource.JobApplicationTask,
    PermissionAction.SELECT
  )
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
  @RequirePermission(
    PermissionResource.JobApplicationTask,
    PermissionAction.UPDATE
  )
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
  @RequirePermission(
    PermissionResource.JobApplicationTask,
    PermissionAction.DELETE
  )
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
