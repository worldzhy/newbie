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
import {RequirePermission} from '../../../../account/authorization/authorization.decorator';
import {RoleService} from '../../../../../microservices/user/role/role.service';
import {UserService} from '../../../../../microservices/user/user.service';
import {generatePaginationParams} from '../../../../../toolkit/pagination/pagination';

@ApiTags('[Application] Recruitment / Job Application / Workflow Step')
@ApiBearerAuth()
@Controller('recruitment-workflow-steps')
export class JobApplicationWorkflowTrailController {
  constructor(
    private readonly workflowStepService: JobApplicationWorkflowTrailService,
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
  async getWorkflowSteps(
    @Query()
    query: {
      workflowId?: string;
      page?: string;
      pageSize?: string;
    }
  ): Promise<JobApplicationWorkflowTrail[]> {
    // [step 1] Construct where argument.
    let where: Prisma.JobApplicationWorkflowTrailWhereInput | undefined;
    if (query.workflowId) {
      where = {workflowId: query.workflowId};
    }

    // [step 2] Construct take and skip arguments.
    const {take, skip} = generatePaginationParams({
      page: query.page,
      pageSize: query.pageSize,
    });

    // [step 3] Get workflow steps.
    const steps = await this.workflowStepService.findMany({
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
        select: {username: true},
      });
      step['processedByUser'] = user.username;

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

  @Get(':stepId')
  @RequirePermission(
    PermissionAction.Get,
    Prisma.ModelName.JobApplicationWorkflowTrail
  )
  @ApiParam({
    name: 'stepId',
    schema: {type: 'number'},
    example: 1,
  })
  async getWorkflowStep(
    @Param('stepId') stepId: string
  ): Promise<JobApplicationWorkflowTrail | null> {
    return await this.workflowStepService.findUnique({
      where: {id: parseInt(stepId)},
    });
  }

  @Patch(':stepId')
  @RequirePermission(
    PermissionAction.Update,
    Prisma.ModelName.JobApplicationWorkflowTrail
  )
  @ApiParam({
    name: 'stepId',
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
  async updateWorkflowStep(
    @Param('stepId') stepId: string,
    @Body() body: Prisma.JobApplicationWorkflowTrailUpdateInput
  ): Promise<JobApplicationWorkflowTrail> {
    return await this.workflowStepService.update({
      where: {id: parseInt(stepId)},
      data: body,
    });
  }

  @Delete(':stepId')
  @RequirePermission(
    PermissionAction.Delete,
    Prisma.ModelName.JobApplicationWorkflowTrail
  )
  @ApiParam({
    name: 'stepId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteWorkflowStep(
    @Param('stepId') stepId: string
  ): Promise<JobApplicationWorkflowTrail> {
    return await this.workflowStepService.delete({
      where: {id: parseInt(stepId)},
    });
  }

  /* End */
}
