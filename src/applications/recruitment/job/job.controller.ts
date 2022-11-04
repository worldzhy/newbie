import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Prisma, Job, PermissionAction} from '@prisma/client';
import {RequirePermission} from '../../account/authorization/authorization.decorator';
import {JobService} from './job.service';

@ApiTags('[Application] Recruitment / Job')
@ApiBearerAuth()
@Controller('recruitment-jobs')
export class JobController {
  constructor(private jobService: JobService) {}

  @Post('')
  @RequirePermission(PermissionAction.create, Prisma.ModelName.Job)
  @ApiBody({
    description: 'Create a user job.',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          position: 'Designer',
          description: 'Designing the UX of mobile applications',
        },
      },
    },
  })
  async createJob(@Body() body: Prisma.JobUncheckedCreateInput): Promise<Job> {
    return await this.jobService.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Job)
  async getJobs(): Promise<Job[]> {
    return await this.jobService.findMany({});
  }

  @Get(':jobId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Job)
  @ApiParam({
    name: 'jobId',
    schema: {type: 'string'},
    description: 'The uuid of the job.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getJob(@Param('jobId') jobId: string): Promise<Job | null> {
    return await this.jobService.findUnique({where: {id: jobId}});
  }

  @Patch(':jobId')
  @RequirePermission(PermissionAction.update, Prisma.ModelName.Job)
  @ApiParam({
    name: 'jobId',
    schema: {type: 'string'},
    description: 'The uuid of the job.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description: 'Update a specific user job.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          email: 'robert.smith@hd.com',
          phone: '131280122',
          givenName: 'Robert',
          middleName: 'William',
          familyName: 'Smith',
        },
      },
    },
  })
  async updateJob(
    @Param('jobId') jobId: string,
    @Body() body: Prisma.JobUpdateInput
  ): Promise<Job> {
    return await this.jobService.update({
      where: {id: jobId},
      data: body,
    });
  }

  @Delete(':jobId')
  @RequirePermission(PermissionAction.delete, Prisma.ModelName.Job)
  @ApiParam({
    name: 'jobId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteUser(@Param('jobId') jobId: string): Promise<Job> {
    return await this.jobService.delete({
      where: {id: jobId},
    });
  }

  @Get(':jobId/job-applications')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Job)
  @ApiParam({
    name: 'jobId',
    schema: {type: 'string'},
    description: 'The uuid of the job.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getJobJobApplications(@Param('jobId') jobId: string): Promise<Job> {
    return await this.jobService.findUniqueOrThrow({
      where: {id: jobId},
      include: {jobApplications: true},
    });
  }

  /* End */
}
