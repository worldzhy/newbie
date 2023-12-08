import {
  Controller,
  Delete,
  Get,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {
  Prisma,
  JobApplicationWorkflowTrail,
  PermissionAction,
} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Recruitment / Job Application / Workflow Trail')
@ApiBearerAuth()
@Controller('recruitment-workflow-steps')
export class JobApplicationWorkflowTrailController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('')
  @RequirePermission(
    PermissionAction.List,
    Prisma.ModelName.JobApplicationWorkflowTrail
  )
  async getWorkflowTrails(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('workflowId') workflowId?: string
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.JobApplicationWorkflowTrailWhereInput | undefined;
    if (workflowId) {
      where = {workflowId: workflowId};
    }

    // [step 2] Get workflow steps.
    const result = await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.JobApplicationWorkflowTrail,
      pagination: {page, pageSize},
      findManyArgs: {where: where, orderBy: {createdAt: 'desc'}},
    });

    // [step 4] Process before return.
    for (let i = 0; i < result.records.length; i++) {
      // Attach processedBy username.
      const step = result.records[i];
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {id: step.processedByUserId},
        include: {profile: {select: {fullName: true}}},
      });
      step['processedByUser'] = user['profile']?.fullName;

      // Attach next role name
      if (step.nextRoleId) {
        const role = await this.prisma.role.findUniqueOrThrow({
          where: {id: step.nextRoleId},
          select: {name: true},
        });
        step['nextRole'] = role.name;
      }
    }

    return result;
  }

  @Get(':trailId')
  @RequirePermission(
    PermissionAction.Get,
    Prisma.ModelName.JobApplicationWorkflowTrail
  )
  async getWorkflowTrail(
    @Param('trailId') trailId: number
  ): Promise<JobApplicationWorkflowTrail | null> {
    return await this.prisma.jobApplicationWorkflowTrail.findUnique({
      where: {id: trailId},
    });
  }

  @Patch(':trailId')
  @RequirePermission(
    PermissionAction.Update,
    Prisma.ModelName.JobApplicationWorkflowTrail
  )
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
    return await this.prisma.jobApplicationWorkflowTrail.update({
      where: {id: trailId},
      data: body,
    });
  }

  @Delete(':trailId')
  @RequirePermission(
    PermissionAction.Delete,
    Prisma.ModelName.JobApplicationWorkflowTrail
  )
  async deleteWorkflowTrail(
    @Param('trailId') trailId: number
  ): Promise<JobApplicationWorkflowTrail> {
    return await this.prisma.jobApplicationWorkflowTrail.delete({
      where: {id: trailId},
    });
  }

  /* End */
}
