import {Controller, Delete, Get, Patch, Body, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {JobApplicationTestingWorkflowService} from './testing-workflow.service';
import {
  Prisma,
  JobApplicationTestingWorkflow,
  PermissionAction,
} from '@prisma/client';
import {RequirePermission} from '../../../../account/authorization/authorization.decorator';

@ApiTags('[Application] Recruitment / Job Application / Testing Workflow')
@ApiBearerAuth()
@Controller('recruitment-job-application-testing-workflows')
export class JobApplicationTestingWorkflowController {
  private testingWorkflowService = new JobApplicationTestingWorkflowService();

  @Get('')
  @RequirePermission(
    PermissionAction.read,
    Prisma.ModelName.JobApplicationTestingWorkflow
  )
  async getTestingWorkflows(): Promise<JobApplicationTestingWorkflow[]> {
    return await this.testingWorkflowService.findMany({});
  }

  @Get(':workflowId')
  @RequirePermission(
    PermissionAction.read,
    Prisma.ModelName.JobApplicationTestingWorkflow
  )
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'number'},
    example: 1,
  })
  async getTestingWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<JobApplicationTestingWorkflow | null> {
    return await this.testingWorkflowService.findUnique({
      where: {id: parseInt(workflowId)},
    });
  }

  @Patch(':workflowId')
  @RequirePermission(
    PermissionAction.update,
    Prisma.ModelName.JobApplicationTestingWorkflow
  )
  @ApiParam({
    name: 'workflowId',
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
  async updateTestingWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() body: Prisma.JobApplicationTestingWorkflowUpdateInput
  ): Promise<JobApplicationTestingWorkflow> {
    return await this.testingWorkflowService.update({
      where: {id: parseInt(workflowId)},
      data: body,
    });
  }

  @Delete(':workflowId')
  @RequirePermission(
    PermissionAction.delete,
    Prisma.ModelName.JobApplicationTestingWorkflow
  )
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteTestingWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<JobApplicationTestingWorkflow> {
    return await this.testingWorkflowService.delete({
      where: {id: parseInt(workflowId)},
    });
  }

  /* End */
}
