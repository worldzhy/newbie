import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  BadRequestException,
  Request,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {JobApplicationTesting, PermissionAction, Prisma} from '@prisma/client';
import {JobApplicationService} from '../job-application.service';
import {JobApplicationTestingService} from './testing.service';
import {RequirePermission} from '../../../account/authorization/authorization.decorator';
import {FileService} from '../../../fmgmt/file/file.service';
import {TokenService} from '../../../../toolkits/token/token.service';
import {WorkflowService} from '../../../../microservices/workflow/workflow.service';

@ApiTags('[Application] Recruitment / Job Application / Testing')
@ApiBearerAuth()
@Controller('recruitment-jobApplication-testings')
export class JobApplicationTestingController {
  private jobApplicationService = new JobApplicationService();
  private jobApplicationTestingService = new JobApplicationTestingService();
  private fileService = new FileService();
  private tokenService = new TokenService();
  private workflowService = new WorkflowService();

  @Get('types')
  listJobApplicationTestingTypes(): string[] {
    return [
      'Medical Screen & Drug Screen Salary',
      'Medical Screen & Drug Screen Hourly',
      'POET - York - PT 1 - Production Tech',
      'POET - York - PT 2 - Production Tech Skilled',
      'POET - York - Maintenance',
      'POET - PDC - Technician',
      'POET - TOM - Production',
      'POET - TOM - Maintenance',
      'POET - PTO - PT - Production Tech',
      'POET - PTO - Maintenance Mechanic',
      'POET - PTO - Maintenance Electrician',
      'POET - PTO - Maintenance Mechanic Millwright',
      'POET - PTO - Tool Room',
    ];
  }

  @Get('sites')
  listJobApplicationTestingSites(): string[] {
    return [
      'Harley Davidson Lifestyle Centers',
      'Concentra Medical Centers',
      'Wilmington Medical Center',
      'Lakeway Urgent Care',
      'Halifax Health ExpressCare',
      'Brookwood Occupational Health',
      'Frederick Health Employer Solutions',
      'UnityPoint',
      'Access Medical Center',
      'DCH Regional',
      'MedExpress',
      'Asante Occupational Health',
      'CoxHealth Occupational Medicine',
      'Drug Screen Compliance',
      'Mercyhealth Occupational Health & Wellness',
      'Advance Medical of Naples, LLC',
      'Labcorp',
      'Nao Medical/Statcare Urgent & Walk',
      'Cascade Occupational Health',
      'Integra Discovery Services',
      'Med Central Health Resource',
      'Mercy Iowa City Occupational Health',
      'Landmark Medical Center',
      'Safeworks, IL',
      'GulfMed Walk',
      'Reliant Medical Group',
      'Mayo Clinic',
      'Cedars Health',
      'KRMC Occupational and Employee Health',
      'Next Level Urgent Care',
      'Sycamore Avenue Medical Center',
      'OSF Occupational Health',
      'Northwell Great Neck, NY (Long Island)',
      'White',
      'Eastern Medical',
      'Select Physical Therapy',
      'KRMC Occ Health',
    ];
  }

  @Post('')
  @RequirePermission(
    PermissionAction.create,
    Prisma.ModelName.JobApplicationTesting
  )
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          state: 'PENDING_DISPATCH',
          type: 'York Skilled Trade',
          site: 'Lakeway Urgent Care',
          jobApplicationId: 'ababdab1-5d91-4af7-ab2b-e2c9744a88d4',
        },
      },
    },
  })
  async createJobApplicationTesting(
    @Body()
    body: Prisma.JobApplicationTestingUncheckedCreateInput
  ): Promise<JobApplicationTesting> {
    // [step 1] Guard statement.
    if (
      !(await this.jobApplicationService.checkExistence(body.jobApplicationId))
    ) {
      throw new BadRequestException(
        'Invalid jobApplicationId in the request body.'
      );
    }

    // [step 2] Create jobApplicationTesting.
    return await this.jobApplicationTestingService.create({data: body});
  }

  @Get('')
  @RequirePermission(
    PermissionAction.read,
    Prisma.ModelName.JobApplicationTesting
  )
  async getJobApplicationTestings(): Promise<JobApplicationTesting[]> {
    return await this.jobApplicationTestingService.findMany({});
  }

  @Get(':testingId')
  @RequirePermission(
    PermissionAction.read,
    Prisma.ModelName.JobApplicationTesting
  )
  @ApiParam({
    name: 'testingId',
    schema: {type: 'string'},
    description: 'The id of the jobApplicationTesting.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getJobApplicationTesting(
    @Param('testingId') testingId: string
  ): Promise<JobApplicationTesting | null> {
    return await this.jobApplicationTestingService.findUnique({
      where: {id: testingId},
      include: {
        jobApplication: {
          include: {candidate: {include: {profile: true, location: true}}},
        },
        workflows: {orderBy: {createdAt: 'desc'}},
      },
    });
  }

  @Patch(':testingId')
  @RequirePermission(
    PermissionAction.update,
    Prisma.ModelName.JobApplicationTesting
  )
  @ApiParam({
    name: 'testingId',
    schema: {type: 'string'},
    description: 'The id of the jobApplicationTesting.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Submit step 1',
        value: {
          appointmentStartsAt: '2022-11-24T04:34:04.126Z',
          appointmentEndsAt: '2022-11-24T04:39:04.126Z',
          workflow: {
            step: 'STEP1_DISPATCH',
            state: 'Pending Test',
            comment: 'Leave some comments here.',
          },
        },
      },
      b: {
        summary: '2. Submit step 2',
        value: {
          fileIds: ['d8141ece-f242-4288-a60a-8675538549cd'],
          workflow: {
            step: 'STEP2_TEST',
            state: 'Pass',
            comment: 'Leave some comments here.',
          },
        },
      },
      c: {
        summary: '3. Submit step 3',
        value: {
          workflow: {
            step: 'STEP3_REVIEW',
            state: 'MD-CLR-WL',
            comment: 'Leave some comments here.',
          },
        },
      },
    },
  })
  async updateJobApplicationTesting(
    @Request() request: Request,
    @Param('testingId') testingId: string,
    @Body()
    body: Prisma.JobApplicationTestingUpdateInput & {
      fileIds?: string[];
      workflow?: {
        step: string;
        state: string;
        comment?: string;
      };
    }
  ): Promise<JobApplicationTesting> {
    // [step 1] Get this testing.
    const testing = await this.jobApplicationTestingService.findUniqueOrThrow({
      where: {id: testingId},
    });

    // [step 2] Get current user's id.
    const {userId} = this.tokenService.decodeToken(
      this.tokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};

    // [step 3] Construct testing's attachments argument if needed.
    if (body.fileIds) {
      const files = await this.fileService.findMany({
        where: {id: {in: body.fileIds}},
      });
      body.attachments = {
        deleteMany: {},
        createMany: {
          data: files.map(file => {
            return {name: file.name, url: file.url};
          }),
        },
      };
      delete body.fileIds;
    }

    // [step 4] Construct testing's workflows CreateInput.
    if (body.workflow) {
      // Set testing.state with workflow.state.
      body.state = body.workflow.state;

      const workflow = await this.workflowService.findUniqueOrThrow({
        where: {
          step_state: {step: body.workflow.step, state: body.workflow.state},
        },
      });
      body.workflows = {
        create: {
          step: body.workflow.step,
          state: body.workflow.state,
          nextStep: workflow.nextStep,
          nextRoleId: workflow.nextRoleId,
          comment: body.workflow.comment,
          processedByUserId: userId,
        },
      };
      delete body.workflow;
    }

    // [step 5] Update the testing's processedByUserIds.
    if (!testing.processedByUserIds.includes(userId)) {
      body.processedByUserIds = testing.processedByUserIds.concat(userId);
    }

    return await this.jobApplicationTestingService.update({
      where: {id: testingId},
      data: body,
    });
  }

  @Delete(':testingId')
  @RequirePermission(
    PermissionAction.delete,
    Prisma.ModelName.JobApplicationTesting
  )
  @ApiParam({
    name: 'testingId',
    schema: {type: 'string'},
    description: 'The id of the jobApplicationTesting.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteJobApplicationTesting(
    @Param('testingId') testingId: string
  ): Promise<JobApplicationTesting> {
    return await this.jobApplicationTestingService.delete({
      where: {id: testingId},
    });
  }

  /**
   * Get job application lock.
   * @param testingId
   * @returns boolean
   */
  @Get(':testingId/lock')
  @RequirePermission(
    PermissionAction.read,
    Prisma.ModelName.JobApplicationTesting
  )
  @ApiParam({
    name: 'testingId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getJobApplicationLock(
    @Param('testingId') testingId: string
  ): Promise<JobApplicationTesting> {
    return await this.jobApplicationTestingService.findUniqueOrThrow({
      where: {id: testingId},
      select: {beingHeldByUserId: true, beingHeldByUser: true},
    });
  }

  /**
   * Lock to prevent other users editing when the current user is editing.
   * @param request
   * @param testingId
   * @returns boolean
   */
  @Patch(':testingId/lock')
  @RequirePermission(
    PermissionAction.update,
    Prisma.ModelName.JobApplicationTesting
  )
  @ApiParam({
    name: 'testingId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async lockJobApplication(
    @Request() request: Request,
    @Param('testingId') testingId: string
  ): Promise<JobApplicationTesting> {
    const {userId} = this.tokenService.decodeToken(
      this.tokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};

    return await this.jobApplicationTestingService.update({
      where: {id: testingId},
      data: {beingHeldByUserId: userId},
    });
  }

  /**
   * Unlock
   * @param request
   * @param testingId
   * @returns
   */
  @Patch(':testingId/unlock')
  @RequirePermission(
    PermissionAction.update,
    Prisma.ModelName.JobApplicationTesting
  )
  @ApiParam({
    name: 'testingId',
    schema: {type: 'number'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async unlockJobApplication(
    @Request() request: Request,
    @Param('testingId') testingId: string
  ): Promise<JobApplicationTesting> {
    const {userId} = this.tokenService.decodeToken(
      this.tokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};
    const jobApplication =
      await this.jobApplicationTestingService.findUniqueOrThrow({
        where: {id: testingId},
      });

    // A user can only unlock the lock set by itself.
    if (jobApplication.beingHeldByUserId === userId) {
      return await this.jobApplicationTestingService.update({
        where: {id: testingId},
        data: {beingHeldByUserId: null},
      });
    } else {
      throw new BadRequestException(
        'A user cannot unlock the lock set by others.'
      );
    }
  }

  /* End */
}
