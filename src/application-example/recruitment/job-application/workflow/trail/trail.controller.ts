import {
  Controller,
  Delete,
  Get,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {JobApplicationWorkflowTrailService} from './trail.service';
import {
  Prisma,
  JobApplicationWorkflowTrail,
  PermissionAction,
} from '@prisma/client';
import {RequirePermission} from '@microservices/account/authorization/authorization.decorator';
import {RoleService} from '@microservices/account/role/role.service';
import {UserService} from '@microservices/account/user/user.service';
import {generatePaginationParams} from '@toolkit/pagination/pagination';

@ApiTags('Recruitment / Job Application / Workflow Trail')
@ApiBearerAuth()
@Controller('recruitment-workflow-steps')
export class JobApplicationWorkflowTrailController {
  constructor(
    private readonly workflowTrailService: JobApplicationWorkflowTrailService,
    private readonly userService: UserService,
    private readonly roleService: RoleService
  ) {}

  @Get('')
  @RequirePermission(
    PermissionAction.List,
    Prisma.ModelName.JobApplicationWorkflowTrail
  )
  @ApiQuery({name: 'workflowId', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getWorkflowTrails(
    @Query('workflowId') workflowId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ): Promise<JobApplicationWorkflowTrail[]> {
    // [step 1] Construct where argument.
    let where: Prisma.JobApplicationWorkflowTrailWhereInput | undefined;
    if (workflowId) {
      where = {workflowId: workflowId};
    }

    // [step 2] Construct take and skip arguments.
    const {take, skip} = generatePaginationParams({
      page: page,
      pageSize: pageSize,
    });

    // [step 3] Get workflow steps.
    const steps = await this.workflowTrailService.findMany({
      where: where,
      take: take,
      skip: skip,
      orderBy: {createdAt: 'desc'},
    });

    // [step 4] Process before return.
    for (let i = 0; i < steps.length; i++) {
      // Attach processedBy username.
      const step = steps[i];
      const user = await this.userService.findUniqueOrThrow({
        where: {id: step.processedByUserId},
        include: {profile: {select: {fullName: true}}},
      });
      step['processedByUser'] = user['profile'].fullName;

      // Attach next role name
      if (step.nextRoleId) {
        const role = await this.roleService.findUniqueOrThrow({
          where: {id: step.nextRoleId},
          select: {name: true},
        });
        step['nextRole'] = role.name;
      }
    }

    return steps;
  }

  @Get(':trailId')
  @RequirePermission(
    PermissionAction.Get,
    Prisma.ModelName.JobApplicationWorkflowTrail
  )
  @ApiParam({
    name: 'trailId',
    schema: {type: 'number'},
    example: 1,
  })
  async getWorkflowTrail(
    @Param('trailId') trailId: number
  ): Promise<JobApplicationWorkflowTrail | null> {
    return await this.workflowTrailService.findUnique({
      where: {id: trailId},
    });
  }

  @Patch(':trailId')
  @RequirePermission(
    PermissionAction.Update,
    Prisma.ModelName.JobApplicationWorkflowTrail
  )
  @ApiParam({
    name: 'trailId',
    schema: {type: 'number'},
    example: 1,
  })
  @ApiBody({
    description: 'Update environment variables.',
    examples: {
      a: {
        summary: '1. Without AWS profile',
        value: {
          awsAccountId: '929553487761',
          awsAccessKeyId: 'fakeAKIXXXXXQB3I56H72',
          awsSecretAccessKey: 'fakeNyXXXXXXXXXrBJk7LUEhXBqHKxG4PiCJ6cQ',
          awsRegion: 'us-east-1',
        },
      },
      b: {
        summary: '2. With AWS profile',
        value: {
          awsAccountId: '929555287761',
          awsProfile: 'InceptionPad',
          awsRegion: 'us-east-1',
        },
      },
    },
  })
  async updateWorkflowTrail(
    @Param('trailId') trailId: number,
    @Body() body: Prisma.JobApplicationWorkflowTrailUpdateInput
  ): Promise<JobApplicationWorkflowTrail> {
    return await this.workflowTrailService.update({
      where: {id: trailId},
      data: body,
    });
  }

  @Delete(':trailId')
  @RequirePermission(
    PermissionAction.Delete,
    Prisma.ModelName.JobApplicationWorkflowTrail
  )
  @ApiParam({
    name: 'trailId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteWorkflowTrail(
    @Param('trailId') trailId: number
  ): Promise<JobApplicationWorkflowTrail> {
    return await this.workflowTrailService.delete({
      where: {id: trailId},
    });
  }

  /* End */
}
