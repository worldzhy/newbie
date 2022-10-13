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
import {
  Prisma,
  Job,
  PermissionResource,
  PermissionAction,
} from '@prisma/client';
import {RequirePermission} from '../../account/authorization/authorization.decorator';
import {JobService} from './job.service';

@ApiTags('[Application] Recruitment / Job')
@ApiBearerAuth()
@Controller('recruitment-jobs')
export class JobController {
  constructor(private jobService: JobService) {}

  @Post('')
  @RequirePermission(PermissionResource.Job, PermissionAction.CREATE)
  @ApiBody({
    description: 'Create a user job.',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          email: 'mary@hd.com',
          phone: '121289182',
          givenName: 'Mary',
          middleName: 'Rose',
          familyName: 'Johnson',
          suffix: 'PhD',
          birthday: new Date(),
          gender: 'male',
          address: '456 White Finch St. North Augusta, SC 29860',
          zipcode: '21000',
          geoJSON: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [125.6, 10.1],
            },
            properties: {
              name: 'Dinagat Islands',
            },
          },
          websites: {facebook: 'https://www.facebook.com/grace'},
          picture:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/800px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
        },
      },
    },
  })
  async createJob(@Body() body: Prisma.JobUncheckedCreateInput): Promise<Job> {
    return await this.jobService.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionResource.Job, PermissionAction.SELECT)
  async getJobs(): Promise<Job[]> {
    return await this.jobService.findMany({});
  }

  @Get(':jobId')
  @RequirePermission(PermissionResource.Job, PermissionAction.SELECT)
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
  @RequirePermission(PermissionResource.Job, PermissionAction.UPDATE)
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
  @RequirePermission(PermissionResource.Job, PermissionAction.DELETE)
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
  @RequirePermission(PermissionResource.Job, PermissionAction.SELECT)
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
