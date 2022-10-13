import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {JobApplicationService} from './job-application.service';

import {
  JobApplication,
  JobApplicationProcessingStepAction,
  JobApplicationReviewCode,
  PermissionAction,
  PermissionResource,
  Prisma,
} from '@prisma/client';
import {CandidateService} from '../candidate/candidate.service';
import {RequirePermission} from '../../account/authorization/authorization.decorator';

@ApiTags('[Application] Recruitment / Job Application')
@ApiBearerAuth()
@Controller('recruitment-job-applications')
export class JobApplicationController {
  private jobApplicationService = new JobApplicationService();
  private candidateService = new CandidateService();

  //* Create
  @Post('')
  @RequirePermission(PermissionResource.JobApplication, PermissionAction.CREATE)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          jobCode: 'J1001',
          jobSite: 'Center Hospital',
          candidateId: 'ababdab1-5d91-4af7-ab2b-e2c9744a88d4',
        },
      },
    },
  })
  async createJobApplication(
    @Body()
    body: Prisma.JobApplicationUncheckedCreateInput
  ): Promise<JobApplication> {
    // [step 1] Guard statement.
    if (!(await this.candidateService.checkExistence(body.candidateId))) {
      throw new BadRequestException('Invalid candidateId in the request body.');
    }

    // [step 2] Create jobApplication.
    return await this.jobApplicationService.create({
      data: {
        candidateId: body.candidateId,
        jobId: body.jobId,
        processingSteps: {
          createMany: {
            skipDuplicates: true,
            data: Object.values(JobApplicationProcessingStepAction).map(
              action => {
                return {action: action};
              }
            ),
          },
        },
      },
    });
  }

  //* Get many
  @Get('')
  @RequirePermission(PermissionResource.JobApplication, PermissionAction.SELECT)
  async getJobApplications(): Promise<JobApplication[]> {
    return await this.jobApplicationService.findMany({});
  }

  //* Get
  @Get(':jobApplicationId')
  @RequirePermission(PermissionResource.JobApplication, PermissionAction.SELECT)
  @ApiParam({
    name: 'jobApplicationId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getJobApplication(
    @Param('jobApplicationId') jobApplicationId: string
  ): Promise<JobApplication | null> {
    return await this.jobApplicationService.findUnique({
      where: {id: jobApplicationId},
    });
  }

  //* Update
  @Patch(':jobApplicationId')
  @RequirePermission(PermissionResource.JobApplication, PermissionAction.UPDATE)
  @ApiParam({
    name: 'jobApplicationId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          reviewCode: JobApplicationReviewCode.MED_CLR,
        },
      },
    },
  })
  async updateJobApplication(
    @Param('jobApplicationId') jobApplicationId: string,
    @Body() body: Prisma.JobApplicationUpdateInput
  ): Promise<JobApplication> {
    return await this.jobApplicationService.update({
      where: {id: jobApplicationId},
      data: body,
    });
  }

  //* Delete
  @Delete(':jobApplicationId')
  @RequirePermission(PermissionResource.JobApplication, PermissionAction.DELETE)
  @ApiParam({
    name: 'jobApplicationId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteJobApplication(
    @Param('jobApplicationId') jobApplicationId: string
  ): Promise<JobApplication> {
    return await this.jobApplicationService.delete({
      where: {id: jobApplicationId},
    });
  }

  //* Get job application notes
  @Get(':jobApplicationId/notes')
  @RequirePermission(PermissionResource.JobApplication, PermissionAction.SELECT)
  @ApiParam({
    name: 'jobApplicationId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getJobApplicationNotes(
    @Param('jobApplicationId') jobApplicationId: string
  ): Promise<JobApplication> {
    return await this.jobApplicationService.findUniqueOrThrow({
      where: {id: jobApplicationId},
      include: {notes: true},
    });
  }

  //* Get job application processing steps
  @Get(':jobApplicationId/processingSteps')
  @RequirePermission(PermissionResource.JobApplication, PermissionAction.SELECT)
  @ApiParam({
    name: 'jobApplicationId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getJobApplicationProcessingSteps(
    @Param('jobApplicationId') jobApplicationId: string
  ): Promise<JobApplication> {
    return await this.jobApplicationService.findUniqueOrThrow({
      where: {id: jobApplicationId},
      include: {processingSteps: true},
    });
  }

  //* Get job application tasks
  @Get(':jobApplicationId/tasks')
  @RequirePermission(PermissionResource.JobApplication, PermissionAction.SELECT)
  @ApiParam({
    name: 'jobApplicationId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getJobApplicationTasks(
    @Param('jobApplicationId') jobApplicationId: string
  ): Promise<JobApplication> {
    return await this.jobApplicationService.findUniqueOrThrow({
      where: {id: jobApplicationId},
      include: {tasks: true},
    });
  }

  /* End */
}
