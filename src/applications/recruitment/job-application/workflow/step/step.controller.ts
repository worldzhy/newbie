import {
  Controller,
  Delete,
  Get,
  Patch,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {JobApplicationWorkflowStepService} from './step.service';
import {
  Prisma,
  JobApplicationWorkflowStep,
  PermissionAction,
} from '@prisma/client';
import {RequirePermission} from '../../../../account/authorization/authorization.decorator';
import {RoleService} from '../../../../account/user/role/role.service';
import {UserService} from '../../../../account/user/user.service';

@ApiTags('[Application] Recruitment / Job Application / Workflow Step')
@ApiBearerAuth()
@Controller('recruitment-workflow-steps')
export class JobApplicationWorkflowStepController {
  private workflowStepService = new JobApplicationWorkflowStepService();
  private userService = new UserService();
  private roleService = new RoleService();

  @Get('')
  @RequirePermission(
    PermissionAction.List,
    Prisma.ModelName.JobApplicationWorkflowStep
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
  ): Promise<JobApplicationWorkflowStep[]> {
    // [step 1] Construct where argument.
    let where: Prisma.JobApplicationWorkflowStepWhereInput | undefined;
    if (query.workflowId) {
      where = {workflowId: query.workflowId};
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
    Prisma.ModelName.JobApplicationWorkflowStep
  )
  @ApiParam({
    name: 'stepId',
    schema: {type: 'number'},
    example: 1,
  })
  async getWorkflowStep(
    @Param('stepId') stepId: string
  ): Promise<JobApplicationWorkflowStep | null> {
    return await this.workflowStepService.findUnique({
      where: {id: parseInt(stepId)},
    });
  }

  @Patch(':stepId')
  @RequirePermission(
    PermissionAction.Update,
    Prisma.ModelName.JobApplicationWorkflowStep
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
    @Body() body: Prisma.JobApplicationWorkflowStepUpdateInput
  ): Promise<JobApplicationWorkflowStep> {
    return await this.workflowStepService.update({
      where: {id: parseInt(stepId)},
      data: body,
    });
  }

  @Delete(':stepId')
  @RequirePermission(
    PermissionAction.Delete,
    Prisma.ModelName.JobApplicationWorkflowStep
  )
  @ApiParam({
    name: 'stepId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteWorkflowStep(
    @Param('stepId') stepId: string
  ): Promise<JobApplicationWorkflowStep> {
    return await this.workflowStepService.delete({
      where: {id: parseInt(stepId)},
    });
  }

  /* End */
}
