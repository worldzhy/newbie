import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  BadRequestException,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {JobApplicationService} from './job-application.service';

import {
  JobApplication,
  JobType,
  Permission,
  PermissionAction,
  Prisma,
  Role,
  TrustedEntityType,
} from '@prisma/client';
import {RequirePermission} from '../../account/authorization/authorization.decorator';
import {CandidateService} from '../candidate/candidate.service';
import {UserService} from '../../account/user/user.service';
import {TokenService} from '../../../toolkits/token/token.service';
import {PermissionService} from '../../../applications/account/authorization/permission/permission.service';
import {WorkflowService} from '../../../applications/workflow/workflow.service';
import {JobApplicationTestingService} from './testing/testing.service';
import {JobApplicationTestingWorkflowService} from './testing/workflow/testing-workflow.service';

@ApiTags('[Application] Recruitment / Job Application')
@ApiBearerAuth()
@Controller('recruitment-job-applications')
export class JobApplicationController {
  private userService = new UserService();
  private tokenService = new TokenService();
  private permissionService = new PermissionService();
  private workflowService = new WorkflowService();
  private candidateService = new CandidateService();
  private jobApplicationService = new JobApplicationService();
  private jobApplicationTestingService = new JobApplicationTestingService();
  private jobApplicationTestingWorkflowService =
    new JobApplicationTestingWorkflowService();

  @Post('')
  @RequirePermission(PermissionAction.create, Prisma.ModelName.JobApplication)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          candidateId: 'd8141ece-f242-4288-a60a-8675538549cd',
          jobSite: 'Harley-Davidson Motor Co. - York-Hourly Only',
          jobType: 'Hourly',
          jobCode: 'MED/DS CLR',
          tests: [
            {type: 'Harley-Davidson York Weld'},
            {type: 'Tomahawk Production Technician'},
          ],
        },
      },
    },
  })
  async createJobApplication(
    @Request() request: Request,
    @Body()
    body: Prisma.JobApplicationUncheckedCreateInput & {
      tests: {type: string; site: string}[];
    }
  ): Promise<JobApplication> {
    // [step 1] Guard statement.
    if (!(await this.candidateService.checkExistence(body.candidateId))) {
      throw new BadRequestException('Invalid candidateId in the request body.');
    }

    // [step 2] Create job application.
    const {userId} = this.tokenService.decodeToken(
      this.tokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};
    const user = await this.userService.findUniqueOrThrow({
      where: {id: userId},
    });
    const jobApplication = await this.jobApplicationService.create({
      data: {
        candidateId: body.candidateId,
        jobSite: body.jobSite,
        jobType: body.jobType,
        jobCode: body.jobCode,
        referredBy: user.username || user.id,
      },
    });

    // [step 3] Create job application testings.
    const workflow = await this.workflowService.findUniqueOrThrow({
      where: {step_state: {step: 'START', state: 'Pending Dispatch'}},
    });
    for (let i = 0; i < body.tests.length; i++) {
      const test = body.tests[i];
      await this.jobApplicationTestingService.create({
        data: {
          jobApplicationId: jobApplication.id,
          state: workflow.state,
          type: test.type,
          processedByUserIds: [userId],
          workflows: {
            create: {
              step: workflow.step,
              state: workflow.state,
              nextStep: workflow.nextStep,
              nextRoleId: workflow.nextRoleId,
              processedByUserId: user.id,
            },
          },
        },
      });
    }

    return jobApplication;
  }

  @Get('count')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.JobApplication)
  async countJobApplications(@Request() request: Request): Promise<number> {
    // [step 1] Get role permission to filter data.
    const permissions = await this.getResourcePermissionsFromHttpRequest(
      request,
      Prisma.ModelName.JobApplication
    );

    // [step 2] Fetch preset where regtax(in seed.ts) for each role.
    let where: Prisma.JobApplicationWhereInput | undefined;
    const whereConditions: object[] = [];
    permissions.map((permission) => {
      if (permission.where) {
        whereConditions.push(permission.where as object);
      }
    });
    if (whereConditions.length > 0) {
      where = {AND: whereConditions};
    }

    // [step 3] Count.
    return await this.jobApplicationService.count({
      where: where,
    });
  }

  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.JobApplication)
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getJobApplications(
    @Request() request: Request,
    @Query() query: {page?: string; pageSize?: string}
  ): Promise<JobApplication[]> {
    // [step 1] Get role permission to filter data.
    const permissions = await this.getResourcePermissionsFromHttpRequest(
      request,
      Prisma.ModelName.JobApplication
    );

    // [step 2] Fetch preset where regtax(in seed.ts) for each role.
    let where: Prisma.JobApplicationWhereInput | undefined;
    const whereConditions: object[] = [];
    permissions.map((permission) => {
      if (permission.where) {
        whereConditions.push(permission.where as object);
      }
    });
    if (whereConditions.length > 0) {
      where = {AND: whereConditions};
    }

    // [step 3] Construct take and skip arguments.
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

    // [step 4] Get job applications.
    return await this.jobApplicationService.findMany({
      where: where,
      take: take,
      skip: skip,
      include: {candidate: {include: {profile: true}}, testings: true},
    });
  }

  @Get('processed/count')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.JobApplication)
  async countProcessedJobApplications(
    @Request() request: Request
  ): Promise<number> {
    // [step 1] Get userId from http request header.
    const {userId} = this.tokenService.decodeToken(
      this.tokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};

    // [step 2] Return count of job applications.
    return await this.jobApplicationService.count({
      where: {
        testings: {some: {processedByUserIds: {has: userId}}},
      },
    });
  }

  @Get('processed')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.JobApplication)
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getProcessedJobApplications(
    @Request() request: Request,
    @Query() query: {page?: string; pageSize?: string}
  ): Promise<JobApplication[]> {
    // [step 1] Get userId from http request header.
    const {userId} = this.tokenService.decodeToken(
      this.tokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};

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

    // [step 4] Return job applications.
    return await this.jobApplicationService.findMany({
      where: {
        testings: {some: {processedByUserIds: {has: userId}}},
      },
      take: take,
      skip: skip,
      include: {
        candidate: {include: {profile: true, location: true}},
        testings: true,
      },
    });
  }

  @Get(':jobApplicationId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.JobApplication)
  @ApiParam({
    name: 'jobApplicationId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getJobApplication(
    @Param('jobApplicationId') jobApplicationId: string
  ): Promise<JobApplication | null> {
    return await this.jobApplicationService.findUnique({
      where: {id: jobApplicationId},
      include: {
        candidate: {include: {profile: true, location: true}},
        notes: true,
        tasks: true,
        testings: true,
      },
    });
  }

  @Patch(':jobApplicationId')
  @RequirePermission(PermissionAction.update, Prisma.ModelName.JobApplication)
  @ApiParam({
    name: 'jobApplicationId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Submit step 2',
        value: {
          jobType: JobType.Hourly,
          jobCode: 'MED/DS CLR', // Only available when jobType is Hourly.
          jobSite: 'Harley-Davidson Motor Co. - York',
          testSite: 'Harley Davidson Lifestyle Centers',
        },
      },
    },
  })
  async updateJobApplication(
    @Param('jobApplicationId') jobApplicationId: string,
    @Body()
    body: Prisma.JobApplicationUpdateInput
  ): Promise<JobApplication> {
    return await this.jobApplicationService.update({
      where: {id: jobApplicationId},
      data: body,
    });
  }

  @Delete(':jobApplicationId')
  @RequirePermission(PermissionAction.delete, Prisma.ModelName.JobApplication)
  @ApiParam({
    name: 'jobApplicationId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteJobApplication(
    @Param('jobApplicationId') jobApplicationId: string
  ): Promise<JobApplication> {
    return await this.jobApplicationService.delete({
      where: {id: jobApplicationId},
    });
  }

  @Get(':jobApplicationId/notes')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.JobApplication)
  @ApiParam({
    name: 'jobApplicationId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getJobApplicationNotes(
    @Param('jobApplicationId') jobApplicationId: string
  ): Promise<JobApplication> {
    return await this.jobApplicationService.findUniqueOrThrow({
      where: {id: jobApplicationId},
      include: {notes: true},
    });
  }

  @Get(':jobApplicationId/tasks')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.JobApplication)
  @ApiParam({
    name: 'jobApplicationId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getJobApplicationTasks(
    @Param('jobApplicationId') jobApplicationId: string
  ): Promise<JobApplication> {
    return await this.jobApplicationService.findUniqueOrThrow({
      where: {id: jobApplicationId},
      include: {tasks: true},
    });
  }

  private async getResourcePermissionsFromHttpRequest(
    request: Request,
    resource: Prisma.ModelName
  ): Promise<Permission[]> {
    let additionalPermission: object | undefined = undefined;

    const {userId} = this.tokenService.decodeToken(
      this.tokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};
    const user = await this.userService.findUniqueOrThrowWithRoles({
      where: {id: userId},
    });
    const roleIds = user['roles'].map((role: Role) => {
      // Provider role only
      if (role.name === 'Provider and Reviewer') {
        additionalPermission = {
          resource: Prisma.ModelName.JobApplication,
          action: PermissionAction.read,
          where: {testSite: {in: user['sites']}},
          trustedEntityId: userId,
          trustedEntityType: TrustedEntityType.USER,
        };
      }

      return role.id;
    });

    const permissions = await this.permissionService.findMany({
      where: {
        resource: resource,
        action: PermissionAction.read,
        trustedEntityId: {in: roleIds},
        trustedEntityType: TrustedEntityType.ROLE,
      },
    });

    if (additionalPermission) {
      permissions.push(additionalPermission);
    }

    return permissions;
  }

  /* End */
}
