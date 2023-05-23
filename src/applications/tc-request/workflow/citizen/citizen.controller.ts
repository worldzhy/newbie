import {Controller, Get, Patch, Body, Param, Post} from '@nestjs/common';
import {ApiTags, ApiParam, ApiBody} from '@nestjs/swagger';
import {TcWorkflow, Prisma} from '@prisma/client';
import {TcWorkflowService, WorkflowStatus} from '../workflow.service';
import {TcWorkflowTrailService} from '../trail/trail.service';
import {RoleService} from '../../../account/user/role/role.service';
import {UserService} from '../../../account/user/user.service';
import {WorkflowRouteService} from '../../../../microservices/workflow/route/route.service';
import {Public} from '../../../account/authentication/public/public.decorator';
import {generateRandomNumbers} from '../../../../toolkits/utilities/common.util';
import {StripeService} from '../../../../microservices/payment/stripe/stripe.service';

@ApiTags('[Application] Tc Request / Workflow / Citizen')
@Public()
@Controller('citizen-workflows')
export class CitizenWorkflowController {
  private userService = new UserService();
  private roleService = new RoleService();
  private workflowRouteService = new WorkflowRouteService();
  private tcWorkflowService = new TcWorkflowService();
  private tcWorkflowTrailService = new TcWorkflowTrailService();
  private stripeService = new StripeService();

  @Post('')
  async createTcWorkflow(@Body() body: any): Promise<TcWorkflow> {
    // [step 1] Get initial route.
    const route = await this.workflowRouteService.findUniqueOrThrow({
      where: {startSign: true}, // Get the starting point of the process.
    });

    // [step 2] Create workflow.
    return await this.tcWorkflowService.create({
      data: {
        status: WorkflowStatus.PendingFill, // The initial status of the workflow.
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

  @Get(':workflowId')
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
        summary: 'Submit DETAILS',
        value: {
          view: 'DETAILS',
          state: 'SUBMIT',
          // DETAILS
          title: 'Miss',
          firstName: 'String',
          middleName: 'String',
          lastName: 'String',
          dateOfBirth: '2022-11-25',
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
        summary: 'Submit PURPOSE',
        value: {
          view: 'PURPOSE',
          state: 'SUBMIT',
          // PURPOSE
          purpose: 'String',
          typeOfEmployment: 'String',
          countryOfTravel: 'String',
          fileIdForTravelProof: 'd8141ece-f242-4288-a60a-8675538549cd',
          otherPurpose: 'String',
          intendedDateOfTravel: '2022-11-25',
          otherInformation: 'String', // If there is no information type "No",
        },
      },
      c: {
        summary: 'Submit TYPE',
        value: {
          view: 'TYPE',
          state: 'SUBMIT',
          // TYPE
          scopeOfConvictions:
            'STANDARD - Includes all current convictions and cautions',
          hasOutsideConviction: true,
          outsideConviction: 'String',
        },
      },
      d: {
        summary: 'Submit MARITAL',
        value: {
          view: 'MARITAL',
          state: 'SUBMIT',
          // MARITAL
          maritalStatus: 'Divorced',
          isNameChanged: true, // Name changed through Marriage or Deed Poll
          preFirstName: 'String',
          preMiddleName: 'String',
          preLastName: 'String',
        },
      },
      e: {
        summary: 'Submit EMPLOYMENT',
        value: {
          view: 'EMPLOYMENT',
          state: 'SUBMIT',
          // EMPLOYMENT
          occupation: 'String',
          nameOfEmployer: 'String',
          addressOfEmployer: 'String',
          telephoneOfEmployer: 'String',
          emailOfEmployer: 'String',
        },
      },
      f: {
        summary: 'Submit CITIZEN_TCUK_OR_OTHERS',
        value: {
          view: 'CITIZEN_TCUK_OR_OTHERS',
          state: 'YES',
          // CITIZEN_TCUK_OR_OTHERS
          isTcUk: true,
        },
      },
      g: {
        summary: 'Submit CITIZEN_TCUK',
        value: {
          view: 'CITIZEN_TCUK',
          state: 'YES',
          // CITIZEN_TCUK
          isTc: true,
          fileIdOfTcPassport: 'd8141ece-f242-4288-a60a-8675538549cd',
          fileIdOfTcCertificate: 'd8141ece-f242-4288-a60a-8675538549cd',
          fileIdOfUkPassport: 'd8141ece-f242-4288-a60a-8675538549cd',
          fileIdOfUkCertificate: 'd8141ece-f242-4288-a60a-8675538549cd',
        },
      },
      h: {
        summary: 'Submit CITIZEN_TC',
        value: {
          view: 'CITIZEN_TC',
          state: 'SUBMIT',
          // CITIZEN_TC
          fileIdOfTcPassport: 'd8141ece-f242-4288-a60a-8675538549cd',
          fileIdOfTcCertificate: 'd8141ece-f242-4288-a60a-8675538549cd',
        },
      },
      i: {
        summary: 'Submit CITIZEN_UK',
        value: {
          view: 'CITIZEN_UK',
          state: 'SUBMIT',
          // CITIZEN_UK
          fileIdOfUkPassport: 'd8141ece-f242-4288-a60a-8675538549cd',
          fileIdOfUkCertificate: 'd8141ece-f242-4288-a60a-8675538549cd',
        },
      },
      j: {
        summary: 'Submit CITIZEN_OTHERS',
        value: {
          view: 'CITIZEN_OTHERS',
          state: 'SUBMIT',
          // CITIZEN_OTHERS
          fileIdOfForeignPassport: 'd8141ece-f242-4288-a60a-8675538549cd',
          fileIdOfForeignCertificate: 'd8141ece-f242-4288-a60a-8675538549cd',
        },
      },
      k: {
        summary: 'Submit PAYMENT',
        value: {
          view: 'PAYMENT',
          state: 'SUBMIT',
          // PAYMENT
          status: WorkflowStatus.PendingReview,
        },
      },
    },
  })
  async updateTcWorkflow(
    @Param('workflowId') workflowId: string,
    @Body()
    body: Prisma.TcWorkflowUpdateInput & {view: string; state: string}
  ): Promise<TcWorkflow> {
    // [step 1] Get workflow route.
    const route = await this.workflowRouteService.findUniqueOrThrow({
      where: {
        view_state: {view: body.view, state: body.state},
      },
    });

    // [step 2] Create workflow trail.
    await this.tcWorkflowTrailService.create({
      data: {
        workflowId: workflowId,
        view: route.view,
        state: route.state,
        nextView: route.nextView,
      },
    });

    // [step 3] Construct workflow's UpdateInput.
    const updateInput: Prisma.TcWorkflowUpdateInput = body;
    updateInput.view = route.view;
    updateInput.state = route.state;
    updateInput.nextView = route.nextView;
    if (updateInput.dateOfBirth) {
      updateInput.dateOfBirth = new Date(updateInput.dateOfBirth.toString());
    }
    if (updateInput.intendedDateOfTravel) {
      updateInput.intendedDateOfTravel = new Date(
        updateInput.intendedDateOfTravel.toString()
      );
    }

    // [step 4] If payment is finished, generate registration number.
    if (updateInput.view === 'PAYMENT' && updateInput.state === 'SUBMIT') {
      const n1 = generateRandomNumbers(3);
      const n2 = generateRandomNumbers(7);
      updateInput.registrationNumber = n1 + '-' + n2;
    }

    return await this.tcWorkflowService.update({
      where: {id: workflowId},
      data: updateInput,
    });
  }

  @Get(':workflowId/payment-intent')
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'string'},
    description: 'The id of the tcWorkflow.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getWorkflowPaymentIntent(@Param('workflowId') workflowId: string) {
    const paymentIntent = await this.stripeService.createPaymentIntent(50); // $0.5 usd
    this.tcWorkflowService.update({
      where: {id: workflowId},
      data: {paymentClientSecret: paymentIntent.clientSecret},
    });
  }

  /* End */
}
