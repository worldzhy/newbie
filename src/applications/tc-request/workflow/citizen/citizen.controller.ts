import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Post,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiParam, ApiBody} from '@nestjs/swagger';
import {TcWorkflow, Prisma, Order} from '@prisma/client';
import {TcWorkflowService, WorkflowStatus} from '../workflow.service';
import {TcWorkflowTrailService} from '../trail/trail.service';
import {RoleService} from '../../../account/user/role/role.service';
import {UserService} from '../../../account/user/user.service';
import {WorkflowRouteService} from '../../../../microservices/workflow/route/route.service';
import {Public} from '../../../account/authentication/public/public.decorator';
import {generateRandomNumbers} from '../../../../toolkits/utilities/common.util';
import {FolderService} from '../../../../microservices/fmgmt/folder/folder.service';
import {OrderService} from '../../../../microservices/order/order.service';
import {StripePaymentIntentService} from '../../../../microservices/order/payment/stripe/payment-intent.service';

const APPLICATION_FEE = 2000;

@ApiTags('[Application] Tc Request / Workflow / Citizen')
@Public()
@Controller('citizen-workflows')
export class CitizenWorkflowController {
  private userService = new UserService();
  private roleService = new RoleService();
  private workflowRouteService = new WorkflowRouteService();
  private folderService = new FolderService();
  private tcWorkflowService = new TcWorkflowService();
  private tcWorkflowTrailService = new TcWorkflowTrailService();
  private orderService = new OrderService();
  private stripePaymentIntentService = new StripePaymentIntentService();

  @Post('')
  async createTcWorkflow(@Body() body: any): Promise<TcWorkflow> {
    // [step 1] Get initial route.
    const route = await this.workflowRouteService.findUniqueOrThrow({
      where: {startSign: true}, // Get the starting point of the process.
    });

    // [step 2] Generate registration number.
    let registrationNumber = '';
    while (registrationNumber === '') {
      registrationNumber =
        generateRandomNumbers(3) + '-' + generateRandomNumbers(7);
      const existed = await this.tcWorkflowService.checkExistence({
        where: {registrationNumber: registrationNumber},
      });

      if (existed) {
        registrationNumber = '';
      }
    }

    // [step 3] Create folder for this citizen.
    const folder = await this.folderService.create({
      data: {name: registrationNumber},
    });

    // [step 4] Create workflow.
    return await this.tcWorkflowService.create({
      data: {
        status: WorkflowStatus.PendingFill, // The initial status of the workflow.
        registrationNumber: registrationNumber,
        folderId: folder.id,
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
          passportNumber: 'LSKJFLFJF232',
          dateOfIssue: '2022-11-25',
          dateOfExpiry: '2022-11-25',
          countryOfIssue: 'String',
          placeOfBirth: 'String',
          // nationality: 'String',
          // otherNationality: 'String',
          statusCardNumber: 'String',
          dateOfStatusCardIssue: '2022-11-25',
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
          state: 'PAYMENT_SUCCEEDED',
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
    // [step 0] Check payment.
    if (body.view === 'PAYMENT' && body.state === 'PAYMENT_SUCCEEDED') {
      const workflow = await this.tcWorkflowService.findUniqueOrThrow({
        where: {id: workflowId},
      });
      if (!workflow.orderId) {
        throw new BadRequestException('Payment has not been finished.');
      }
      const stripePaymentIntents =
        await this.stripePaymentIntentService.findMany({
          where: {orderId: workflow.orderId},
        });

      let paymentComplete = false;
      for (let i = 0; i < stripePaymentIntents.length; i++) {
        const paymentIntent = await this.stripePaymentIntentService.retrieve(
          stripePaymentIntents[i].id
        );
        if (
          paymentIntent.status === 'succeeded' &&
          APPLICATION_FEE === paymentIntent.amount
        ) {
          paymentComplete = true;
          break;
        }
      }

      if (paymentComplete === false) {
        throw new BadRequestException(
          'Payment has not been finished correctly.'
        );
      }
    }

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
    if (updateInput.dateOfIssue) {
      updateInput.dateOfIssue = new Date(updateInput.dateOfIssue.toString());
    }
    if (updateInput.dateOfExpiry) {
      updateInput.dateOfExpiry = new Date(updateInput.dateOfExpiry.toString());
    }
    if (updateInput.dateOfStatusCardIssue) {
      updateInput.dateOfStatusCardIssue = new Date(
        updateInput.dateOfStatusCardIssue.toString()
      );
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
  async getWorkflowPaymentIntent(
    @Param('workflowId') workflowId: string
  ): Promise<{clientSecret: any}> {
    // [step 1] Get workflow.
    const workflow = await this.tcWorkflowService.findUniqueOrThrow({
      where: {id: workflowId},
    });

    // [step 2] Get order.
    let order: Order;
    if (workflow.orderId) {
      order = await this.orderService.findUniqueOrThrow({
        where: {id: workflow.orderId},
      });
    } else {
      order = await this.orderService.create({
        data: {
          totalPrice: APPLICATION_FEE, // $20 usd
          currency: 'usd',
        },
      });

      await this.tcWorkflowService.update({
        where: {id: workflowId},
        data: {orderId: order.id},
      });
    }

    // [step 3] Generate stripe payment intent.
    return await this.stripePaymentIntentService.generate({
      orderId: order.id,
      orderAmount: order.totalPrice,
    });
  }

  /* End */
}
