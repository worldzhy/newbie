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
  JobApplicationProcessingStepAction,
  JobApplicationReviewCode,
  PermissionAction,
  Prisma,
  Role,
  TrustedEntityType,
  UserTokenStatus,
} from '@prisma/client';
import {CandidateService} from '../candidate/candidate.service';
import {RequirePermission} from '../../account/authorization/authorization.decorator';
import {TokenService} from '../../../toolkits/token/token.service';
import {UserTokenService} from '../../account/user/token/token.service';
import {UserService} from '../../account/user/user.service';
import {PermissionService} from '../../../applications/account/authorization/permission/permission.service';

@ApiTags('[Application] Recruitment / Job Application')
@ApiBearerAuth()
@Controller('recruitment-job-applications')
export class JobApplicationController {
  private userService = new UserService();
  private tokenService = new TokenService();
  private userTokenService = new UserTokenService();
  private permissionService = new PermissionService();
  private jobApplicationService = new JobApplicationService();
  private candidateService = new CandidateService();

  @Get('count')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.JobApplication)
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'position', type: 'string'})
  async countJobApplications(
    @Request() request: Request,
    @Query() query: {name?: string; position?: string}
  ): Promise<number> {
    // [step 1] Get role permission to filter data.
    const token = this.tokenService.getTokenFromHttpRequest(request);
    const userToken = await this.userTokenService.findFirstOrThrow({
      where: {AND: [{token: token}, {status: UserTokenStatus.ACTIVE}]},
    });
    const user = await this.userService.findUniqueOrThrowWithRoles({
      where: {id: userToken.userId},
    });
    const roleIds = user['roles'].map((role: Role) => {
      return role.id;
    });
    const permissions = await this.permissionService.findMany({
      where: {
        resource: Prisma.ModelName.JobApplication,
        action: PermissionAction.read,
        trustedEntityId: {in: roleIds},
        trustedEntityType: TrustedEntityType.ROLE,
      },
    });

    // [step 2] Construct where argument.
    let where: Prisma.JobApplicationWhereInput | undefined;
    const whereConditions: object[] = [];
    permissions.map(permission => {
      if (permission.conditions) {
        whereConditions.push(permission.conditions as object);
      }
    });
    if (query.name) {
      const name = query.name.trim();
      if (name.length > 0) {
        whereConditions.push({
          candidate: {
            is: {
              OR: [
                {givenName: {search: name}},
                {familyName: {search: name}},
                {middleName: {search: name}},
              ],
            },
          },
        });
      }
    }
    if (query.position) {
      const position = query.position.trim();
      if (position.length > 0) {
        whereConditions.push({job: {is: {position: {search: position}}}});
      }
    }

    if (whereConditions.length > 0) {
      where = {OR: whereConditions};
    }

    // [step 3] Count.
    return await this.jobApplicationService.count({
      where: where,
    });
  }

  @Post('')
  @RequirePermission(PermissionAction.create, Prisma.ModelName.JobApplication)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          jobId: 'e60e052b-ff37-4bbf-a0e3-bda8b0b371a2',
          candidateId: '3302844d-9a92-4e4c-a4b4-6043e4a98ff4',
        },
      },
    },
  })
  async createJobApplication(
    @Body()
    body: Prisma.JobApplicationUncheckedCreateInput
  ): Promise<JobApplication> {
    // [step 1] Guard statement.
    if (!(await this.candidateService.checkExistence(body.candidateId))) {
      throw new BadRequestException('Invalid candidateId in the request body.');
    }

    // [step 2] Create jobApplication.
    return await this.jobApplicationService.create({
      data: {
        candidateId: body.candidateId,
        jobId: body.jobId,
        processingSteps: {
          createMany: {
            skipDuplicates: true,
            data: Object.values(JobApplicationProcessingStepAction).map(
              action => {
                return {action: action};
              }
            ),
          },
        },
      },
    });
  }

  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.JobApplication)
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'position', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getJobApplications(
    @Request() request: Request,
    @Query()
    query: {
      name?: string;
      position?: string;
      page?: string;
      pageSize?: string;
    }
  ): Promise<JobApplication[]> {
    // [step 1] Get role permission to filter data.
    const token = this.tokenService.getTokenFromHttpRequest(request);
    const userToken = await this.userTokenService.findFirstOrThrow({
      where: {AND: [{token: token}, {status: UserTokenStatus.ACTIVE}]},
    });
    const user = await this.userService.findUniqueOrThrowWithRoles({
      where: {id: userToken.userId},
    });
    const roleIds = user['roles'].map((role: Role) => {
      return role.id;
    });
    const permissions = await this.permissionService.findMany({
      where: {
        resource: Prisma.ModelName.JobApplication,
        action: PermissionAction.read,
        trustedEntityId: {in: roleIds},
        trustedEntityType: TrustedEntityType.ROLE,
      },
    });

    // [step 2] Construct where argument.
    let where: Prisma.JobApplicationWhereInput | undefined;
    const whereConditions: object[] = [];
    permissions.map(permission => {
      if (permission.conditions) {
        whereConditions.push(permission.conditions as object);
      }
    });
    if (query.name) {
      const name = query.name.trim();
      if (name.length > 0) {
        whereConditions.push({
          candidate: {
            is: {
              OR: [
                {givenName: {search: name}},
                {familyName: {search: name}},
                {middleName: {search: name}},
              ],
            },
          },
        });
      }
    }
    if (query.position) {
      const position = query.position.trim();
      if (position.length > 0) {
        whereConditions.push({job: {is: {position: {search: position}}}});
      }
    }

    if (whereConditions.length > 0) {
      where = {OR: whereConditions};
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

    // [step 3] Get job applications.
    return await this.jobApplicationService.findMany({
      where: where,
      take: take,
      skip: skip,
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
        summary: '1. Update',
        value: {
          reviewCode: JobApplicationReviewCode.MED_CLR,
        },
      },
    },
  })
  async updateJobApplication(
    @Param('jobApplicationId') jobApplicationId: string,
    @Body() body: Prisma.JobApplicationUpdateInput
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

  //* Get job application notes
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

  //* Get job application processing steps
  @Get(':jobApplicationId/processingSteps')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.JobApplication)
  @ApiParam({
    name: 'jobApplicationId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getJobApplicationProcessingSteps(
    @Param('jobApplicationId') jobApplicationId: string
  ): Promise<JobApplication> {
    return await this.jobApplicationService.findUniqueOrThrow({
      where: {id: jobApplicationId},
      include: {processingSteps: true},
    });
  }

  //* Get job application tasks
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

  /* End */
}
