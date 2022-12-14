import {Controller, Delete, Get, Patch, Body, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {JobApplicationWorkflowFileService} from './file.service';

import {
  JobApplicationWorkflowFile,
  PermissionAction,
  Prisma,
} from '@prisma/client';
import {RequirePermission} from '../../../../account/authorization/authorization.decorator';

@ApiTags('[Application] Recruitment / Job Application / Workflow File')
@ApiBearerAuth()
@Controller('recruitment-workflow-files')
export class JobApplicationWorkflowFileController {
  private jobApplicationWorkflowFileService =
    new JobApplicationWorkflowFileService();

  @Get('')
  @RequirePermission(
    PermissionAction.read,
    Prisma.ModelName.JobApplicationWorkflowFile
  )
  async getJobApplicationWorkflowFiles(): Promise<
    JobApplicationWorkflowFile[]
  > {
    return await this.jobApplicationWorkflowFileService.findMany({});
  }

  @Get(':FileId')
  @RequirePermission(
    PermissionAction.read,
    Prisma.ModelName.JobApplicationWorkflowFile
  )
  @ApiParam({
    name: 'FileId',
    schema: {type: 'number'},
    description: 'The id of the jobApplicationWorkflowFile.',
    example: 1,
  })
  async getJobApplicationWorkflowFile(
    @Param('FileId') FileId: string
  ): Promise<JobApplicationWorkflowFile | null> {
    return await this.jobApplicationWorkflowFileService.findUnique({
      where: {id: parseInt(FileId)},
    });
  }

  @Patch(':FileId')
  @RequirePermission(
    PermissionAction.update,
    Prisma.ModelName.JobApplicationWorkflowFile
  )
  @ApiParam({
    name: 'FileId',
    schema: {type: 'number'},
    description: 'The id of the jobApplicationWorkflowFile.',
    example: 1,
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          reporterComment: 'This is an updated comment.',
        },
      },
    },
  })
  async updateJobApplicationWorkflowFile(
    @Param('FileId') FileId: string,
    @Body() body: Prisma.JobApplicationWorkflowFileUpdateInput
  ): Promise<JobApplicationWorkflowFile> {
    return await this.jobApplicationWorkflowFileService.update({
      where: {id: parseInt(FileId)},
      data: body,
    });
  }

  @Delete(':FileId')
  @RequirePermission(
    PermissionAction.delete,
    Prisma.ModelName.JobApplicationWorkflowFile
  )
  @ApiParam({
    name: 'FileId',
    schema: {type: 'number'},
    description: 'The id of the jobApplicationWorkflowFile.',
    example: 1,
  })
  async deleteJobApplicationWorkflowFile(
    @Param('FileId') FileId: string
  ): Promise<JobApplicationWorkflowFile> {
    return await this.jobApplicationWorkflowFileService.delete({
      where: {id: parseInt(FileId)},
    });
  }

  /* End */
}
