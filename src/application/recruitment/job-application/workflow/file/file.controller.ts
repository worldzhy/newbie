import {Controller, Delete, Get, Patch, Body, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {JobApplicationWorkflowFileService} from './file.service';

import {
  JobApplicationWorkflowFile,
  PermissionAction,
  Prisma,
} from '@prisma/client';
import {RequirePermission} from '../../../../../microservices/account/authorization/authorization.decorator';

@ApiTags('Recruitment / Job Application / Workflow File')
@ApiBearerAuth()
@Controller('recruitment-workflow-files')
export class JobApplicationWorkflowFileController {
  constructor(
    private readonly jobApplicationWorkflowFileService: JobApplicationWorkflowFileService
  ) {}

  @Get('')
  @RequirePermission(
    PermissionAction.List,
    Prisma.ModelName.JobApplicationWorkflowFile
  )
  async getJobApplicationWorkflowFiles(): Promise<
    JobApplicationWorkflowFile[]
  > {
    return await this.jobApplicationWorkflowFileService.findMany({});
  }

  @Get(':fileId')
  @RequirePermission(
    PermissionAction.Get,
    Prisma.ModelName.JobApplicationWorkflowFile
  )
  @ApiParam({
    name: 'fileId',
    schema: {type: 'number'},
    description: 'The id of the jobApplicationWorkflowFile.',
    example: 1,
  })
  async getJobApplicationWorkflowFile(
    @Param('fileId') fileId: number
  ): Promise<JobApplicationWorkflowFile | null> {
    return await this.jobApplicationWorkflowFileService.findUnique({
      where: {id: fileId},
    });
  }

  @Patch(':fileId')
  @RequirePermission(
    PermissionAction.Update,
    Prisma.ModelName.JobApplicationWorkflowFile
  )
  @ApiParam({
    name: 'fileId',
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
    @Param('fileId') fileId: number,
    @Body() body: Prisma.JobApplicationWorkflowFileUpdateInput
  ): Promise<JobApplicationWorkflowFile> {
    return await this.jobApplicationWorkflowFileService.update({
      where: {id: fileId},
      data: body,
    });
  }

  @Delete(':fileId')
  @RequirePermission(
    PermissionAction.Delete,
    Prisma.ModelName.JobApplicationWorkflowFile
  )
  @ApiParam({
    name: 'fileId',
    schema: {type: 'number'},
    description: 'The id of the jobApplicationWorkflowFile.',
    example: 1,
  })
  async deleteJobApplicationWorkflowFile(
    @Param('fileId') fileId: number
  ): Promise<JobApplicationWorkflowFile> {
    return await this.jobApplicationWorkflowFileService.delete({
      where: {id: fileId},
    });
  }

  /* End */
}
