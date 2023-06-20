import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Request,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {JobApplicationWorkflowTaskService} from './task.service';

import {
  JobApplicationWorkflowTask,
  JobApplicationWorkflowTaskState,
  PermissionAction,
  Prisma,
} from '@prisma/client';
import {RequirePermission} from '../../../../account/authorization/authorization.decorator';
import {UserService} from '../../../../account/user/user.service';
import {TokenService} from '../../../../../toolkits/token/token.service';
import {JobApplicationWorkflowService} from '../workflow.service';

@ApiTags('[Application] Recruitment / Job Application / Workflow Task')
@ApiBearerAuth()
@Controller('recruitment-workflow-tasks')
export class JobApplicationWorkflowTaskController {
  private userService = new UserService();
  private tokenService = new TokenService();
  private jobApplicationWorkflowService = new JobApplicationWorkflowService();
  private jobApplicationWorkflowTaskService =
    new JobApplicationWorkflowTaskService();

  @Post('')
  @RequirePermission(
    PermissionAction.Create,
    Prisma.ModelName.JobApplicationWorkflowTask
  )
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          reporterComment: 'This an example task.',
          assigneeUserId: 'ccabdab1-5d91-4af7-ab2b-e2c9744a88ss',
          workflowId: 'ababdab1-5d91-4af7-ab2b-e2c9744a88d4',
        },
      },
    },
  })
  async createJobApplicationWorkflowTask(
    @Request() request: Request,
    @Body()
    body: Prisma.JobApplicationWorkflowTaskUncheckedCreateInput
  ): Promise<JobApplicationWorkflowTask> {
    // [step 1] Guard statement.
    if (
      !(await this.jobApplicationWorkflowService.checkExistence(
        body.workflowId
      ))
    ) {
      throw new BadRequestException('Invalid workflowId in the request body.');
    }

    // [step 2] Get reporter user.
    const {userId} = this.tokenService.decodeToken(
      this.tokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};
    const reporterUser = await this.userService.findUniqueOrThrow({
      where: {id: userId},
    });
    body.reporter = reporterUser.username;
    body.reporterUserId = userId;

    // [step 3] Get assignee user.
    const assigneeUser = await this.userService.findUniqueOrThrow({
      where: {id: body.assigneeUserId},
    });
    body.assignee = assigneeUser.username;

    // [step 3] Create jobApplicationTest.
    return await this.jobApplicationWorkflowTaskService.create({data: body});
  }

  @Get('')
  @RequirePermission(
    PermissionAction.List,
    Prisma.ModelName.JobApplicationWorkflowTask
  )
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  @ApiQuery({name: 'assignedToMe', type: 'string'})
  async getJobApplicationWorkflowTasks(
    @Request() request: Request,
    @Query() query: {page?: string; pageSize?: string; assignedToMe?: string}
  ): Promise<JobApplicationWorkflowTask[]> {
    // [step 1] Construct where argument.
    let where: Prisma.JobApplicationWorkflowTaskWhereInput | undefined =
      undefined;
    if (query.assignedToMe && query.assignedToMe.trim()) {
      const {userId} = this.tokenService.decodeToken(
        this.tokenService.getTokenFromHttpRequest(request)
      ) as {userId: string};
      where = {assigneeUserId: userId};
    }

    // [step 2] Construct take and skip arguments.
    let take: number, skip: number;
    if (query.page && query.pageSize) {
      // Actually 'page' is string because it comes from URL param.
      const page = parseInt(query.page);
      const pageSize = parseInt(query.pageSize);
      if (page > 0 && pageSize > 0) {
        take = pageSize;
        skip = pageSize * (page - 1);
      } else {
        throw new BadRequestException(
          'The page and pageSize must be larger than 0.'
        );
      }
    } else {
      take = 10;
      skip = 0;
    }

    return await this.jobApplicationWorkflowTaskService.findMany({
      where: where,
      take: take,
      skip: skip,
    });
  }

  @Get(':taskId')
  @RequirePermission(
    PermissionAction.Get,
    Prisma.ModelName.JobApplicationWorkflowTask
  )
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    description: 'The id of the jobApplicationTest.',
    example: 1,
  })
  async getJobApplicationWorkflowTask(
    @Param('taskId') taskId: string
  ): Promise<JobApplicationWorkflowTask | null> {
    return await this.jobApplicationWorkflowTaskService.findUnique({
      where: {id: parseInt(taskId)},
    });
  }

  @Patch(':taskId')
  @RequirePermission(
    PermissionAction.Update,
    Prisma.ModelName.JobApplicationWorkflowTask
  )
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    description: 'The id of the jobApplicationTest.',
    example: 1,
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          state: JobApplicationWorkflowTaskState.DONE,
        },
      },
    },
  })
  async updateJobApplicationWorkflowTask(
    @Param('taskId') taskId: string,
    @Body() body: Prisma.JobApplicationWorkflowTaskUpdateInput
  ): Promise<JobApplicationWorkflowTask> {
    return await this.jobApplicationWorkflowTaskService.update({
      where: {id: parseInt(taskId)},
      data: body,
    });
  }

  @Delete(':taskId')
  @RequirePermission(
    PermissionAction.Delete,
    Prisma.ModelName.JobApplicationWorkflowTask
  )
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    description: 'The id of the jobApplicationTest.',
    example: 1,
  })
  async deleteJobApplicationWorkflowTask(
    @Param('taskId') taskId: string
  ): Promise<JobApplicationWorkflowTask> {
    return await this.jobApplicationWorkflowTaskService.delete({
      where: {id: parseInt(taskId)},
    });
  }

  /* End */
}
