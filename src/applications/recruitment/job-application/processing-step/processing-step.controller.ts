import {Controller, Delete, Get, Patch, Body, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ProcessingStepService} from './processing-step.service';
import {
  Prisma,
  JobApplicationProcessingStep,
  PermissionResource,
  PermissionAction,
} from '@prisma/client';
import {RequirePermission} from '../../../account/authorization/authorization.decorator';

@ApiTags('[Application] Recruitment / Job Application / Processing Step')
@ApiBearerAuth()
@Controller('recruitment-job-application-processing-steps')
export class ProcessingStepController {
  private environmentService = new ProcessingStepService();

  //* Get many
  @Get('')
  @RequirePermission(
    PermissionResource.JobApplicationProcessingStep,
    PermissionAction.SELECT
  )
  async getProcessingSteps(): Promise<JobApplicationProcessingStep[]> {
    return await this.environmentService.findMany({});
  }

  //* Get
  @Get(':processingStepId')
  @RequirePermission(
    PermissionResource.JobApplicationProcessingStep,
    PermissionAction.SELECT
  )
  @ApiParam({
    name: 'processingStepId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async getProcessingStep(
    @Param('processingStepId') processingStepId: string
  ): Promise<JobApplicationProcessingStep | null> {
    return await this.environmentService.findUnique({
      where: {id: parseInt(processingStepId)},
    });
  }

  //* Update
  @Patch(':processingStepId')
  @RequirePermission(
    PermissionResource.JobApplicationProcessingStep,
    PermissionAction.UPDATE
  )
  @ApiParam({
    name: 'processingStepId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
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
  async updateProcessingStep(
    @Param('processingStepId') processingStepId: string,
    @Body() body: Prisma.JobApplicationProcessingStepUpdateInput
  ): Promise<JobApplicationProcessingStep> {
    return await this.environmentService.update({
      where: {id: parseInt(processingStepId)},
      data: body,
    });
  }

  //* Delete
  @Delete(':processingStepId')
  @RequirePermission(
    PermissionResource.JobApplicationProcessingStep,
    PermissionAction.DELETE
  )
  @ApiParam({
    name: 'processingStepId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteProcessingStep(
    @Param('processingStepId') processingStepId: string
  ): Promise<JobApplicationProcessingStep> {
    return await this.environmentService.delete({
      where: {id: parseInt(processingStepId)},
    });
  }
  /* End */
}
