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
import {JobApplicationTaskService} from './task.service';

import {
  JobApplicationTask,
  JobApplicationTaskState,
  PermissionAction,
  Prisma,
} from '@prisma/client';
import {JobApplicationService} from '../job-application.service';
import {RequirePermission} from '../../../account/authorization/authorization.decorator';
import {UserService} from '../../../account/user/user.service';
import {TokenService} from '../../../../toolkits/token/token.service';

@ApiTags('[Application] Recruitment / Job Application / Task')
@ApiBearerAuth()
@Controller('recruitment-job-application-tasks')
export class JobApplicationTaskController {
  private userService = new UserService();
  private tokenService = new TokenService();
  private jobApplicationTestService = new JobApplicationTaskService();
  private jobApplicationService = new JobApplicationService();

  @Post('')
  @RequirePermission(
    PermissionAction.create,
    Prisma.ModelName.JobApplicationTask
  )
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          reporterComment: 'This an example task.',
          assigneeUserId: 'ccabdab1-5d91-4af7-ab2b-e2c9744a88ss',
          jobApplicationId: 'ababdab1-5d91-4af7-ab2b-e2c9744a88d4',
        },
      },
    },
  })
  async createJobApplicationTask(
    @Request() request: Request,
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
    return await this.jobApplicationTestService.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.JobApplicationTask)
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  @ApiQuery({name: 'assignedToMe', type: 'string'})
  async getJobApplicationTasks(
    @Request() request: Request,
    @Query() query: {page?: string; pageSize?: string; assignedToMe?: string}
  ): Promise<JobApplicationTask[]> {
    // [step 1] Construct where argument.
    let where: Prisma.JobApplicationTaskWhereInput | undefined = undefined;
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

    return await this.jobApplicationTestService.findMany({
      where: where,
      take: take,
      skip: skip,
    });
  }

  @Get(':taskId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.JobApplicationTask)
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

  @Patch(':taskId')
  @RequirePermission(
    PermissionAction.update,
    Prisma.ModelName.JobApplicationTask
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

  @Delete(':taskId')
  @RequirePermission(
    PermissionAction.delete,
    Prisma.ModelName.JobApplicationTask
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
