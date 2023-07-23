import {
  Controller,
  Delete,
  Get,
  Patch,
  Body,
  Param,
  BadRequestException,
  Request,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {JobApplicationWorkflow, PermissionAction, Prisma} from '@prisma/client';
import {JobApplicationWorkflowService} from './workflow.service';
import {JobApplicationWorkflowFileService} from './file/file.service';
import {JobApplicationWorkflowTrailService} from './trail/trail.service';
import {RequirePermission} from '../../../account/authorization/authorization.decorator';
import {RoleService} from '../../../account/role/role.service';
import {UserService} from '../../../account/user/user.service';
import {WorkflowRouteService} from '../../../../microservices/workflow/route/route.service';
import {FileService} from '../../../../microservices/fmgmt/file/file.service';
import {AccessTokenService} from '../../../../toolkit/token/token.service';

@ApiTags('[Application] Recruitment / Job Application / Workflow')
@ApiBearerAuth()
@Controller('recruitment-workflows')
export class JobApplicationWorkflowController {
  private fileService = new FileService();
  private accessTokenService = new AccessTokenService();
  private userService = new UserService();
  private roleService = new RoleService();
  private workflowRouteService = new WorkflowRouteService();
  private jobApplicationWorkflowService = new JobApplicationWorkflowService();
  private jobApplicationWorkflowTrailService =
    new JobApplicationWorkflowTrailService();
  private jobApplicationWorkflowFileService =
    new JobApplicationWorkflowFileService();

  @Get('test-types')
  listJobApplicationWorkflowTypes(): string[] {
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

  @Get('test-sites')
  listJobApplicationWorkflowSites(): string[] {
    return [
      // Alphabetical
      'Access Medical Center',
      'Advance Medical of Naples, LLC',
      'Asante Occupational Health',
      'Brookwood Occupational Health',
      'Cascade Occupational Health',
      'Cedars Health',
      'Concentra Medical Centers',
      'CoxHealth Occupational Medicine',
      'DCH Regional',
      'Drug Screen Compliance',
      'Eastern Medical',
      'Frederick Health Employer Solutions',
      'GulfMed Walk',
      'Halifax Health ExpressCare',
      'HD Lifestyle Center - PTO',
      'HD Lifestyle Center - Tomahaw',
      'HD Lifestyle Center - York',
      'Integra Discovery Services',
      'KRMC Occupational and Employee Health',
      'KRMC Occ Health',
      'Labcorp',
      'Lakeway Urgent Care',
      'Landmark Medical Center',
      'MedExpress',
      'Med Central Health Resource',
      'Mercyhealth Occupational Health & Wellness',
      'Mercy Iowa City Occupational Health',
      'Mayo Clinic',
      'Nao Medical/Statcare Urgent & Walk',
      'Next Level Urgent Care',
      'Northwell Great Neck, NY (Long Island)',
      'OSF Occupational Health',
      'Reliant Medical Group',
      'Safeworks, IL',
      'Select Physical Therapy',
      'Sycamore Avenue Medical Center',
      'UnityPoint',
      'White',
      'Wilmington Medical Center',
    ];
  }

  @Get('')
  @RequirePermission(
    PermissionAction.List,
    Prisma.ModelName.JobApplicationWorkflow
  )
  async getJobApplicationWorkflows(): Promise<JobApplicationWorkflow[]> {
    return await this.jobApplicationWorkflowService.findMany({});
  }

  @Get(':workflowId')
  @RequirePermission(
    PermissionAction.Get,
    Prisma.ModelName.JobApplicationWorkflow
  )
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'string'},
    description: 'The id of the jobApplicationWorkflow.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getJobApplicationWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<JobApplicationWorkflow> {
    const workflow = await this.jobApplicationWorkflowService.findUniqueOrThrow(
      {
        where: {id: workflowId},
        include: {
          jobApplication: {
            include: {candidate: {include: {profile: true}}},
          },
          payload: true,
          trails: {orderBy: {createdAt: 'desc'}},
          notes: true,
          tasks: true,
        },
      }
    );

    // [step 4] Process before return.
    for (let i = 0; i < workflow['steps'].length; i++) {
      // Attach processedBy username.
      const step = workflow['steps'][i];
      const user = await this.userService.findUniqueOrThrow({
        where: {id: step.processedByUserId},
        select: {username: true},
      });
      step['processedByUser'] = user.username;

      // Attach next role name.
      if (step.nextRoleId) {
        const role = await this.roleService.findUniqueOrThrow({
          where: {id: step.nextRoleId},
          select: {name: true},
        });
        step['nextRole'] = role.name;
      }

      // Attach files.
      step.files = await this.jobApplicationWorkflowFileService.findMany({
        where: {
          workflowStepId: step.id,
        },
      });
    }

    return workflow;
  }

  @Patch(':workflowId')
  @RequirePermission(
    PermissionAction.Update,
    Prisma.ModelName.JobApplicationWorkflow
  )
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'string'},
    description: 'The id of the jobApplicationWorkflow.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Submit step 1',
        value: {
          viewId: 1,
          stateId: 2,
          comment: 'Leave some comments here.',
          payload: {
            testSite: 'Harley Davidson Lifestyle Centers',
            appointmentStartsAt: '2022-11-25T06:45:46.768Z',
            appointmentEndsAt: '2022-11-25T07:45:46.768Z',
          },
        },
      },
      b: {
        summary: '2. Submit step 2',
        value: {
          viewId: 2,
          stateId: 1,
          comment: 'Leave some comments here.',
          fileIds: ['d8141ece-f242-4288-a60a-8675538549cd'],
        },
      },
      c: {
        summary: '3. Submit step 3',
        value: {
          viewId: 3,
          stateId: 1,
          comment: 'Leave some comments here.',
        },
      },
    },
  })
  async updateJobApplicationWorkflow(
    @Request() request: Request,
    @Param('workflowId') workflowId: string,
    @Body()
    body: {
      viewId: number;
      stateId: number;
      comment?: string;
      payload?: {
        testSite?: string;
        appointmentStartsAt?: string;
        appointmentEndsAt?: string;
      };
      fileIds?: string[];
    }
  ): Promise<JobApplicationWorkflow> {
    // [step 1] Get workflow.
    const workflow = await this.jobApplicationWorkflowService.findUniqueOrThrow(
      {
        where: {id: workflowId},
      }
    );

    // [step 2] Get current user's id.
    const {userId} = this.accessTokenService.decodeToken(
      this.accessTokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};

    // [step 3] Get workflow route.
    const route = await this.workflowRouteService.findUniqueOrThrow({
      where: {
        viewId_stateId: {viewId: body.viewId, stateId: body.stateId},
      },
    });

    // [step 4] Create workflow step.
    const step = await this.jobApplicationWorkflowTrailService.create({
      data: {
        workflowId: workflowId,
        viewId: route.viewId,
        stateId: route.stateId,
        nextViewId: route.nextViewId,
        nextRoleId: route.nextRoleId,
        processedByUserId: userId,
        comment: body.comment,
      },
    });

    // [step 5] Construct workflow's UpdateInput.
    const updateInput: Prisma.JobApplicationWorkflowUpdateInput = {};
    if (!workflow.processedByUserIds.includes(userId)) {
      updateInput.processedByUserIds =
        workflow.processedByUserIds.concat(userId);
    }
    updateInput.stateId = route.stateId;
    updateInput.nextViewId = route.nextViewId;
    updateInput.nextRoleId = route.nextRoleId;
    if (body.payload) {
      updateInput.payload = {
        update: {
          testSite: body.payload.testSite,
          appointmentStartsAt: body.payload.appointmentStartsAt,
          appointmentEndsAt: body.payload.appointmentEndsAt,
        },
      };
    }

    if (body.fileIds) {
      // Filter null value in the fileIds array.
      const fileIds = body.fileIds.filter(fileId => fileId !== null);
      const files = await this.fileService.findMany({
        where: {id: {in: fileIds}},
      });
      updateInput.files = {
        createMany: {
          data: files.map(file => {
            return {
              fileId: file.id,
              originalName: file.originalName,
              workflowStepId: step.id,
            };
          }),
        },
      };
    }

    return await this.jobApplicationWorkflowService.update({
      where: {id: workflowId},
      data: updateInput,
    });
  }

  @Delete(':workflowId')
  @RequirePermission(
    PermissionAction.Delete,
    Prisma.ModelName.JobApplicationWorkflow
  )
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'string'},
    description: 'The id of the jobApplicationWorkflow.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteJobApplicationWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<JobApplicationWorkflow> {
    return await this.jobApplicationWorkflowService.delete({
      where: {id: workflowId},
    });
  }

  /**
   * Get job application lock.
   * @param workflowId
   * @returns boolean
   */
  @Get(':workflowId/lock')
  @RequirePermission(
    PermissionAction.Get,
    Prisma.ModelName.JobApplicationWorkflow
  )
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getJobApplicationLock(
    @Param('workflowId') workflowId: string
  ): Promise<JobApplicationWorkflow> {
    return await this.jobApplicationWorkflowService.findUniqueOrThrow({
      where: {id: workflowId},
      select: {beingHeldByUserId: true, beingHeldByUser: true},
    });
  }

  /**
   * Lock to prevent other users editing when the current user is editing.
   * @param request
   * @param workflowId
   * @returns boolean
   */
  @Patch(':workflowId/lock')
  @RequirePermission(
    PermissionAction.Update,
    Prisma.ModelName.JobApplicationWorkflow
  )
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async lockJobApplication(
    @Request() request: Request,
    @Param('workflowId') workflowId: string
  ): Promise<JobApplicationWorkflow> {
    const {userId} = this.accessTokenService.decodeToken(
      this.accessTokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};

    return await this.jobApplicationWorkflowService.update({
      where: {id: workflowId},
      data: {beingHeldByUserId: userId},
    });
  }

  /**
   * Unlock
   * @param request
   * @param workflowId
   * @returns
   */
  @Patch(':workflowId/unlock')
  @RequirePermission(
    PermissionAction.Update,
    Prisma.ModelName.JobApplicationWorkflow
  )
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'number'},
    description: 'The uuid of the jobApplication.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async unlockJobApplication(
    @Request() request: Request,
    @Param('workflowId') workflowId: string
  ): Promise<JobApplicationWorkflow> {
    const {userId} = this.accessTokenService.decodeToken(
      this.accessTokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};
    const jobApplication =
      await this.jobApplicationWorkflowService.findUniqueOrThrow({
        where: {id: workflowId},
      });

    // A user can only unlock the lock set by itself.
    if (jobApplication.beingHeldByUserId === userId) {
      return await this.jobApplicationWorkflowService.update({
        where: {id: workflowId},
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
