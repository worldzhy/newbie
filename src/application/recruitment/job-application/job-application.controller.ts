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
import {RequirePermission} from '../../../microservices/account/authorization/authorization.decorator';
import {CandidateService} from '../candidate/candidate.service';
import {AccessTokenService} from '../../../toolkit/token/access-token/access-token.service';
import {WorkflowRouteService} from '../../../microservices/workflow/workflow-route.service';
import {JobApplicationWorkflowService} from './workflow/workflow.service';
import {RoleService} from '../../../microservices/account/role/role.service';
import {JobApplicationWorkflowFileService} from './workflow/file/file.service';
import {generatePaginationParams} from '../../../toolkit/pagination/pagination';
import {UserService} from '../../../microservices/account/user/user.service';
import {PermissionService} from '../../../microservices/account/permission/permission.service';

@ApiTags('Recruitment / Job Application')
@ApiBearerAuth()
@Controller('recruitment-job-applications')
export class JobApplicationController {
  constructor(
    private readonly userService: UserService,
    private readonly accessTokenService: AccessTokenService,
    private readonly permissionService: PermissionService,
    private readonly workflowRouteService: WorkflowRouteService,
    private readonly candidateService: CandidateService,
    private readonly roleService: RoleService,
    private readonly jobApplicationService: JobApplicationService,
    private readonly jobApplicationWorkflowService: JobApplicationWorkflowService,
    private readonly jobApplicationWorkflowFileService: JobApplicationWorkflowFileService
  ) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.JobApplication)
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
          testTypes: [
            'Harley-Davidson York Weld',
            'Tomahawk Production Technician',
          ],
        },
      },
    },
  })
  async createJobApplication(
    @Request() request: Request,
    @Body()
    body: Prisma.JobApplicationUncheckedCreateInput
  ): Promise<JobApplication> {
    // [step 1] Guard statement.
    if (!(await this.candidateService.checkExistence(body.candidateId))) {
      throw new BadRequestException('Invalid candidateId in the request body.');
    }

    // [step 2] Create job application.
    const {userId} = this.accessTokenService.decodeToken(
      this.accessTokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};
    const user = await this.userService.findUniqueOrThrow({
      where: {id: userId},
    });
    const jobApplication = await this.jobApplicationService.create({
      data: {...body, referredBy: user.username || user.id},
    });

    // [step 3] Create job application testings.
    if (!body.testTypes) {
      throw new BadRequestException('Invalid testTypes in the request body.');
    }
    const route = await this.workflowRouteService.findUniqueOrThrow({
      where: {startSign: true}, // Get the starting point of the process.
    });
    for (let i = 0; i < (body.testTypes as string[]).length; i++) {
      const testType = body.testTypes[i];
      await this.jobApplicationWorkflowService.create({
        data: {
          jobApplicationId: jobApplication.id,
          stateId: route.stateId,
          nextViewId: route.nextViewId,
          nextRoleId: route.nextRoleId,
          payload: {create: {testType: testType}},
          trails: {
            create: {
              viewId: route.viewId,
              stateId: route.stateId,
              nextViewId: route.nextViewId,
              nextRoleId: route.nextRoleId,
              processedByUserId: userId,
            },
          },
          processedByUserIds: [userId],
        },
      });
    }

    return jobApplication;
  }

  @Get('count')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.JobApplication)
  async countJobApplications(@Request() request: Request): Promise<number> {
    // [step 1] Get role permission to filter data.
    const permissions = await this.getResourcePermissionsFromHttpRequest(
      request,
      Prisma.ModelName.JobApplication
    );

    // [step 2] Fetch preset where regtax(in seed.ts) for each role.
    let where: Prisma.JobApplicationWhereInput | undefined;
    const whereConditions: object[] = [];
    permissions.map(permission => {
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
  @RequirePermission(PermissionAction.List, Prisma.ModelName.JobApplication)
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getJobApplications(
    @Request() request: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ): Promise<JobApplication[]> {
    // [step 1] Construct where arguments.
    let where: Prisma.JobApplicationWhereInput | undefined;
    const whereConditions: object[] = [];

    // Get role permission to filter data. Fetch preset where regtax(in seed.ts) for each role.
    const permissions = await this.getResourcePermissionsFromHttpRequest(
      request,
      Prisma.ModelName.JobApplication
    );
    permissions.map(permission => {
      if (permission.where) {
        whereConditions.push(permission.where as object);
      }
    });
    if (whereConditions.length > 0) {
      where = {AND: whereConditions};
    }

    // [step 2] Construct take and skip arguments.
    const {take, skip} = generatePaginationParams({
      page: page,
      pageSize: pageSize,
    });

    // [step 4] Get job applications.
    const roleIds = await this.getRoleIdsFromHttpRequest(request);
    return await this.jobApplicationService.findMany({
      where: where,
      orderBy: {updatedAt: 'desc'},
      take: take,
      skip: skip,
      include: {
        candidate: {include: {profile: true}},
        workflows: {
          where: {nextRoleId: {in: roleIds}},
          include: {payload: true},
        },
      },
    });
  }

  @Get('processed/count')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.JobApplication)
  async countProcessedJobApplications(
    @Request() request: Request
  ): Promise<number> {
    // [step 1] Get userId from http request header.
    const {userId} = this.accessTokenService.decodeToken(
      this.accessTokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};

    // [step 2] Return count of job applications.
    return await this.jobApplicationService.count({
      where: {
        workflows: {some: {processedByUserIds: {has: userId}}},
      },
    });
  }

  @Get('processed')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.JobApplication)
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getProcessedJobApplications(
    @Request() request: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ): Promise<JobApplication[]> {
    // [step 1] Get userId from http request header.
    const {userId} = this.accessTokenService.decodeToken(
      this.accessTokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};

    // [step 2] Construct take and skip arguments.
    const {take, skip} = generatePaginationParams({
      page: page,
      pageSize: pageSize,
    });

    // [step 4] Return job applications.
    return await this.jobApplicationService.findMany({
      where: {
        workflows: {some: {processedByUserIds: {has: userId}}},
      },
      orderBy: {updatedAt: 'desc'},
      take: take,
      skip: skip,
      include: {
        candidate: {include: {profile: true}},
        workflows: {
          where: {processedByUserIds: {has: userId}},
          include: {payload: true},
        },
      },
    });
  }

  @Get('all/count')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.JobApplication)
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  @ApiQuery({name: 'dateRange', type: 'string', isArray: true})
  async getAllJobApplicationsCount(
    @Query() query: {page?: string; pageSize?: string; dateRange: string[]}
  ): Promise<number> {
    // [step 1] Construct where arguments.
    let where: Prisma.JobApplicationWhereInput | undefined;
    if (Array.isArray(query.dateRange) && query.dateRange.length === 2) {
      where = {
        createdAt: {gte: query.dateRange[0], lte: query.dateRange[1]},
      };
    }

    // [step 2] Return job applications.
    return await this.jobApplicationService.count({
      where: where,
    });
  }

  @Get('all')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.JobApplication)
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  @ApiQuery({name: 'dateRange', type: 'string', isArray: true})
  async getAllJobApplications(
    @Query('dateRange') dateRange?: string[],
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ): Promise<JobApplication[]> {
    // [step 1] Construct where arguments.
    let where: Prisma.JobApplicationWhereInput | undefined;
    if (Array.isArray(dateRange) && dateRange.length === 2) {
      where = {
        createdAt: {gte: dateRange[0], lte: dateRange[1]},
      };
    }
    // [step 2] Construct take and skip arguments.
    const {take, skip} = generatePaginationParams({
      page: page,
      pageSize: pageSize,
    });

    // [step 2] Get job applications.
    const jobApplications = await this.jobApplicationService.findMany({
      where: where,
      orderBy: {updatedAt: 'desc'},
      take: take,
      skip: skip,
      include: {
        candidate: {include: {profile: true}},
        workflows: {
          include: {
            payload: true,
            trails: {orderBy: {createdAt: 'desc'}},
          },
        },
      },
    });

    // [step 3] Process before return.
    for (let i = 0; i < jobApplications.length; i++) {
      const jobApplication = jobApplications[i];
      for (let j = 0; j < jobApplication['workflows'].length; j++) {
        const workflow = jobApplication['workflows'][j];
        for (let k = 0; k < workflow['steps'].length; k++) {
          const step = workflow['steps'][k];

          // Attach processedBy username.
          const user = await this.userService.findUniqueOrThrow({
            where: {id: step.processedByUserId},
            select: {username: true},
          });
          step['processedByUser'] = user.username;

          // Attach next role name.
          if (step.nextRoleId) {
            const role = await this.roleService.findUniqueOrThrow({
              where: {id: step.nextRoleId},
              select: {name: true},
            });
            step['nextRole'] = role.name;
          }

          // Attach files.
          step.files = await this.jobApplicationWorkflowFileService.findMany({
            where: {
              workflowStepId: step.id,
            },
          });
        }
      }
    }

    return jobApplications;
  }

  @Get(':jobApplicationId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.JobApplication)
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
        candidate: {include: {profile: true}},
        workflows: true,
      },
    });
  }

  @Patch(':jobApplicationId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.JobApplication)
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
        summary: '1. Update',
        value: {
          jobType: JobType.Hourly,
          jobCode: 'MED/DS CLR', // Only available when jobType is Hourly.
          jobSite: 'Harley-Davidson Motor Co. - York',
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
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.JobApplication)
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

  private async getResourcePermissionsFromHttpRequest(
    request: Request,
    resource: Prisma.ModelName
  ): Promise<Permission[]> {
    let additionalPermission: object | undefined = undefined;

    const {userId} = this.accessTokenService.decodeToken(
      this.accessTokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};
    const user = await this.userService.findUniqueOrThrow({
      where: {id: userId},
      include: {roles: true},
    });
    const roleIds = user['roles'].map((role: Role) => {
      // Provider role only
      if (role.name === 'Provider and Reviewer') {
        additionalPermission = {
          resource: resource,
          action: PermissionAction.List,
          trustedEntityId: userId,
          trustedEntityType: TrustedEntityType.USER,
        };
      }

      return role.id;
    });

    const permissions = await this.permissionService.findMany({
      where: {
        resource: resource,
        action: PermissionAction.List,
        trustedEntityId: {in: roleIds},
        trustedEntityType: TrustedEntityType.ROLE,
      },
    });

    if (additionalPermission) {
      permissions.push(additionalPermission);
    }

    return permissions;
  }

  private async getRoleIdsFromHttpRequest(request: Request): Promise<string[]> {
    const {userId} = this.accessTokenService.decodeToken(
      this.accessTokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};
    const user = await this.userService.findUniqueOrThrow({
      where: {id: userId},
      include: {roles: true},
    });

    return user['roles'].map((role: Role) => {
      return role.id;
    });
  }

  /* End */
}
