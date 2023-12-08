import {Controller, Delete, Get, Patch, Body, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';

import {
  JobApplicationWorkflowFile,
  PermissionAction,
  Prisma,
} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Recruitment / Job Application / Workflow File')
@ApiBearerAuth()
@Controller('recruitment-workflow-files')
export class JobApplicationWorkflowFileController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('')
  @RequirePermission(
    PermissionAction.List,
    Prisma.ModelName.JobApplicationWorkflowFile
  )
  async getJobApplicationWorkflowFiles(): Promise<
    JobApplicationWorkflowFile[]
  > {
    return await this.prisma.jobApplicationWorkflowFile.findMany({});
  }

  @Get(':fileId')
  @RequirePermission(
    PermissionAction.Get,
    Prisma.ModelName.JobApplicationWorkflowFile
  )
  async getJobApplicationWorkflowFile(
    @Param('fileId') fileId: number
  ): Promise<JobApplicationWorkflowFile | null> {
    return await this.prisma.jobApplicationWorkflowFile.findUnique({
      where: {id: fileId},
    });
  }

  @Patch(':fileId')
  @RequirePermission(
    PermissionAction.Update,
    Prisma.ModelName.JobApplicationWorkflowFile
  )
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
    return await this.prisma.jobApplicationWorkflowFile.update({
      where: {id: fileId},
      data: body,
    });
  }

  @Delete(':fileId')
  @RequirePermission(
    PermissionAction.Delete,
    Prisma.ModelName.JobApplicationWorkflowFile
  )
  async deleteJobApplicationWorkflowFile(
    @Param('fileId') fileId: number
  ): Promise<JobApplicationWorkflowFile> {
    return await this.prisma.jobApplicationWorkflowFile.delete({
      where: {id: fileId},
    });
  }

  /* End */
}
