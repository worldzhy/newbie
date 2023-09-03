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
import {
  JobApplicationWorkflowTask,
  JobApplicationWorkflowTaskState,
  PermissionAction,
  Prisma,
} from '@prisma/client';
import {RequirePermission} from '@microservices/account/authorization/authorization.decorator';
import {AccessTokenService} from '@toolkit/token/access-token/access-token.service';
import {JobApplicationWorkflowService} from '../workflow.service';
import {JobApplicationWorkflowTaskService} from './task.service';
import {generatePaginationParams} from '@toolkit/pagination/pagination';
import {UserService} from '@microservices/account/user/user.service';

@ApiTags('Recruitment / Job Application / Workflow Task')
@ApiBearerAuth()
@Controller('recruitment-workflow-tasks')
export class JobApplicationWorkflowTaskController {
  constructor(
    private readonly userService: UserService,
    private readonly accessTokenService: AccessTokenService,
    private readonly jobApplicationWorkflowService: JobApplicationWorkflowService,
    private readonly jobApplicationWorkflowTaskService: JobApplicationWorkflowTaskService
  ) {}

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
    const {userId} = this.accessTokenService.decodeToken(
      this.accessTokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};
    const reporterUser = await this.userService.findUniqueOrThrow({
      where: {id: userId},
      include: {profile: {select: {fullName: true}}},
    });
    body.reporter = reporterUser['profile'].fullName;
    body.reporterUserId = userId;

    // [step 3] Get assignee user.
    const assigneeUser = await this.userService.findUniqueOrThrow({
      where: {id: body.assigneeUserId},
      include: {profile: {select: {fullName: true}}},
    });
    body.assignee = assigneeUser['profile'].fullName;

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
    @Query('assignedToMe') assignedToMe?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ): Promise<JobApplicationWorkflowTask[]> {
    // [step 1] Construct where argument.
    let where: Prisma.JobApplicationWorkflowTaskWhereInput | undefined =
      undefined;
    if (assignedToMe && assignedToMe.trim()) {
      const {userId} = this.accessTokenService.decodeToken(
        this.accessTokenService.getTokenFromHttpRequest(request)
      ) as {userId: string};
      where = {assigneeUserId: userId};
    }

    // [step 2] Construct take and skip arguments.
    const {take, skip} = generatePaginationParams({
      page: page,
      pageSize: pageSize,
    });

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
    @Param('taskId') taskId: number
  ): Promise<JobApplicationWorkflowTask | null> {
    return await this.jobApplicationWorkflowTaskService.findUnique({
      where: {id: taskId},
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
    @Param('taskId') taskId: number,
    @Body() body: Prisma.JobApplicationWorkflowTaskUpdateInput
  ): Promise<JobApplicationWorkflowTask> {
    return await this.jobApplicationWorkflowTaskService.update({
      where: {id: taskId},
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
    @Param('taskId') taskId: number
  ): Promise<JobApplicationWorkflowTask> {
    return await this.jobApplicationWorkflowTaskService.delete({
      where: {id: taskId},
    });
  }

  /* End */
}
