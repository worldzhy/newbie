import {
  Controller,
  Delete,
  Get,
  Patch,
  Body,
  Param,
  Request,
  Post,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {TcWorkflow, PermissionAction, Prisma} from '@prisma/client';
import {TcWorkflowService} from './workflow.service';
import {TcWorkflowTrailService} from './trail/trail.service';
import {RequirePermission} from '../../account/authorization/authorization.decorator';
import {RoleService} from '../../account/user/role/role.service';
import {UserService} from '../../account/user/user.service';
import {WorkflowRouteService} from '../../../microservices/workflow/route/route.service';
import {TokenService} from '../../../toolkits/token/token.service';

@ApiTags('[Application] Tc Request / Workflow')
@ApiBearerAuth()
@Controller('tc-workflows')
export class TcWorkflowController {
  private tokenService = new TokenService();
  private userService = new UserService();
  private roleService = new RoleService();
  private workflowRouteService = new WorkflowRouteService();
  private tcWorkflowService = new TcWorkflowService();
  private tcWorkflowTrailService = new TcWorkflowTrailService();

  @Post('')
  @RequirePermission(PermissionAction.create, Prisma.ModelName.TcWorkflow)
  async createTcWorkflow(@Body() body: any): Promise<TcWorkflow> {
    // [step 1] Get initial route.
    const route = await this.workflowRouteService.findUniqueOrThrow({
      where: {startSign: true}, // Get the starting point of the process.
    });

    // [step 2] Create workflow.
    return await this.tcWorkflowService.create({
      data: {
        ...body,
        view: route.view,
        state: route.state,
        nextView: route.nextView,
        trails: {
          create: {
            view: route.view,
            state: route.state,
            nextView: route.nextView,
          },
        },
      },
    });
  }

  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.TcWorkflow)
  async getTcWorkflows(): Promise<TcWorkflow[]> {
    return await this.tcWorkflowService.findMany({});
  }

  @Get(':workflowId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.TcWorkflow)
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'string'},
    description: 'The id of the tcWorkflow.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getTcWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<TcWorkflow> {
    const workflow = await this.tcWorkflowService.findUniqueOrThrow({
      where: {id: workflowId},
      include: {
        trails: {orderBy: {createdAt: 'desc'}},
      },
    });

    // [step 4] Process before return.
    for (let i = 0; i < workflow['trails'].length; i++) {
      const trail = workflow['trails'][i];
      // Attach processedBy username.
      if (trail.processedByUserId) {
        const user = await this.userService.findUniqueOrThrow({
          where: {id: trail.processedByUserId},
          select: {username: true},
        });
        trail['processedByUser'] = user.username;
      }

      // Attach next role name.
      if (trail.nextRoleId) {
        const role = await this.roleService.findUniqueOrThrow({
          where: {id: trail.nextRoleId},
          select: {name: true},
        });
        trail['nextRole'] = role.name;
      }
    }

    return workflow;
  }

  @Patch(':workflowId')
  @RequirePermission(PermissionAction.update, Prisma.ModelName.TcWorkflow)
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'string'},
    description: 'The id of the tcWorkflow.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: 'Submit VIEW1_DETAILS',
        value: {
          view: 'VIEW1_DETAILS',
          state: 'SUBMIT',
          // VIEW1_DETAILS
          title: 'Miss',
          firstName: 'String',
          middleName: 'String',
          lastName: 'String',
          dateOfBirth: '2022-11-25T06:45:46.768Z',
          gender: 'String',
          address: 'String',
          island: 'String',
          district: 'String',
          addressOutsideTC: '',
          landlinePhone: 'String',
          mobile: 'String',
          email: 'String', //  If you have made previous Certificate of Character applications, the email you enter here will replace any you have previously entered. This means that all email correspondence we send regarding previous applications will now be sent to this address.,
          fileIdForRecentPhoto: 'd8141ece-f242-4288-a60a-8675538549cd',
          // passportNumber: 'String',
          // dateOfIssue: '2022-11-25T06:45:46.768Z',
          // dateOfExpiry: '2022-11-25T06:45:46.768Z',
          // countryOfIssue: 'String',
          // placeOfBirth: 'String',
          // nationality: 'String',
          // otherNationality: 'String',
          // statusCardNumber: 'String',
          // dateOfStatusCardIssue: '2022-11-25T06:45:46.768Z',
        },
      },
      b: {
        summary: 'Submit VIEW2_PURPOSE',
        value: {
          view: 'VIEW2_PURPOSE',
          state: 'SUBMIT',
          // VIEW2_PURPOSE
          purpose: 'String',
          typeOfEmployment: 'String',
          countryOfTravel: 'String',
          otherPurpose: 'String',
          intendedDateOfTravel: '2022-11-25T06:45:46.768Z',
          otherInfomation: 'String', // If there is no information type "No",
        },
      },
      c: {
        summary: 'Submit VIEW4_TYPE',
        value: {
          view: 'VIEW4_TYPE',
          state: 'SUBMIT',
          // VIEW4_TYPE
          scopeOfConvictions: 'ENHANCED',
          hasOutsideConviction: true,
          outsideConviction: 'String',
        },
      },
      d: {
        summary: 'Submit VIEW5_MARITAL',
        value: {
          view: 'VIEW5_MARITAL',
          state: 'SUBMIT',
          // VIEW5_MARITAL
          maritalStatus: 'Divorced',
          isNameChanged: true, // Name changed through Marriage or Deed Poll
          preFirstName: 'String',
          preMiddleName: 'String',
          preLastName: 'String',
        },
      },
      e: {
        summary: 'Submit VIEW6_EMPLOYMENT',
        value: {
          view: 'VIEW6_EMPLOYMENT',
          state: 'SUBMIT',
          // VIEW6_EMPLOYMENT
          occupation: 'String',
          nameOfEmployer: 'String',
          addressOfEmployer: 'String',
          telephoneOfEmployer: 'String',
          emailOfEmployer: 'String',
        },
      },
      f: {
        summary: 'Submit VIEW7_TCUK_?',
        value: {
          view: 'VIEW7_TCUK_?',
          state: 'YES',
          // VIEW7_TCUK_?
          isTcUk: true,
        },
      },
      g: {
        summary: 'VIEW8_TCUK_YES',
        value: {
          view: 'VIEW8_TCUK_YES',
          state: 'YES',
          // VIEW8_TCUK_YES
          isTc: true,
          fileIdOfTcPassport: 'd8141ece-f242-4288-a60a-8675538549cd',
          fileIdOfTcCertificate: 'd8141ece-f242-4288-a60a-8675538549cd',
          fileIdOfUkPassport: 'd8141ece-f242-4288-a60a-8675538549cd',
          fileIdOfUkCertificate: 'd8141ece-f242-4288-a60a-8675538549cd',
        },
      },
      h: {
        summary: 'VIEW10_TCUK_YES_TC',
        value: {
          view: 'VIEW10_TCUK_YES_TC',
          state: 'SUBMIT',
          // VIEW10_TCUK_YES_TC
          fileIdOfTcPassport: 'd8141ece-f242-4288-a60a-8675538549cd',
          fileIdOfTcCertificate: 'd8141ece-f242-4288-a60a-8675538549cd',
        },
      },
      i: {
        summary: 'VIEW11_TCUK_YES_UK',
        value: {
          view: 'VIEW11_TCUK_YES_UK',
          state: 'SUBMIT',
          // VIEW11_TCUK_YES_UK
          fileIdOfUkPassport: 'd8141ece-f242-4288-a60a-8675538549cd',
          fileIdOfUkCertificate: 'd8141ece-f242-4288-a60a-8675538549cd',
        },
      },
      j: {
        summary: 'VIEW9_TCUK_NO',
        value: {
          view: 'VIEW9_TCUK_NO',
          state: 'SUBMIT',
          // VIEW9_TCUK_NO
          fileIdOfForeignPassport: 'd8141ece-f242-4288-a60a-8675538549cd',
          fileIdOfForeignCertificate: 'd8141ece-f242-4288-a60a-8675538549cd',
        },
      },
    },
  })
  async updateTcWorkflow(
    @Request() request: Request,
    @Param('workflowId') workflowId: string,
    @Body()
    body: Prisma.TcWorkflowUpdateInput & {view: string; state: string}
  ): Promise<TcWorkflow> {
    // [step 1] Get workflow.
    const workflow = await this.tcWorkflowService.findUniqueOrThrow({
      where: {id: workflowId},
    });

    // [step 2] Get current user's id.
    const {userId} = this.tokenService.decodeToken(
      this.tokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};

    // [step 3] Get workflow route.
    const route = await this.workflowRouteService.findUniqueOrThrow({
      where: {
        view_state: {view: body.view, state: body.state},
      },
    });

    // [step 4] Create workflow trail.
    await this.tcWorkflowTrailService.create({
      data: {
        workflowId: workflowId,
        view: route.view,
        state: route.state,
        nextView: route.nextView,
        processedByUserId: userId,
      },
    });

    // [step 5] Construct workflow's UpdateInput.
    const updateInput: Prisma.TcWorkflowUpdateInput = body;
    if (!workflow.processedByUserIds.includes(userId)) {
      updateInput.processedByUserIds =
        workflow.processedByUserIds.concat(userId);
    }
    updateInput.view = route.view;
    updateInput.state = route.state;
    updateInput.nextView = route.nextView;

    return await this.tcWorkflowService.update({
      where: {id: workflowId},
      data: updateInput,
    });
  }

  @Delete(':workflowId')
  @RequirePermission(PermissionAction.delete, Prisma.ModelName.TcWorkflow)
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'string'},
    description: 'The id of the tcWorkflow.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteTcWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<TcWorkflow> {
    return await this.tcWorkflowService.delete({
      where: {id: workflowId},
    });
  }

  /* End */
}
