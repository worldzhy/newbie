import {
  Controller,
  Delete,
  Get,
  Patch,
  Body,
  Param,
  BadRequestException,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {TcWorkflow, Prisma} from '@prisma/client';
import {TcWorkflowService, WorkflowStatus} from '../workflow.service';
import {RoleService} from '../../../account/role/role.service';
import {UserService} from '../../../account/user/user.service';
import {formatPaginationResponse} from '../../../../toolkit/format/pagination.format';
import {TokenService} from '../../../../toolkit/token/token.service';

@ApiTags('[Application] Tc Request / Workflow / Officer')
@ApiBearerAuth()
@Controller('officer-workflows')
export class OfficerWorkflowController {
  private userService = new UserService();
  private roleService = new RoleService();
  private tokenService = new TokenService();
  private tcWorkflowService = new TcWorkflowService();

  @Get('statuses')
  async getTcWorkflowStatuses() {
    return Object.values(WorkflowStatus);
  }

  @Get('')
  @ApiQuery({name: 'statuses', type: 'string', isArray: true})
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'dateOfRequest', type: 'string'})
  @ApiQuery({name: 'email', type: 'string'})
  @ApiQuery({name: 'registrationNumber', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getTcWorkflows(
    @Query()
    query: {
      statuses?: string[];
      name?: string;
      dateOfRequest?: string;
      email?: string;
      registrationNumber?: string;
      page?: string;
      pageSize?: string;
    }
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.UserWhereInput | undefined;
    const whereConditions: object[] = [];
    if (query.statuses && query.statuses.length > 0) {
      whereConditions.push({status: {in: query.statuses}});
    }

    if (query.name) {
      const name = query.name.trim();
      if (name.length > 0) {
        whereConditions.push({fullName: {contains: name}});
      }
    }

    if (query.dateOfRequest) {
      const dateOfRequest = query.dateOfRequest.trim();
      if (dateOfRequest.length > 0) {
        whereConditions.push({
          dateOfRequest: new Date(dateOfRequest.toString()),
        });
      }
    }

    if (query.email) {
      const email = query.email.trim();
      if (email.length > 0) {
        whereConditions.push({email: email});
      }
    }

    if (query.registrationNumber) {
      const registrationNumber = query.registrationNumber.trim();
      if (registrationNumber.length > 0) {
        whereConditions.push({registrationNumber: registrationNumber});
      }
    }

    if (whereConditions.length > 1) {
      where = {AND: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
    }

    // [step 2] Construct take and skip arguments.
    let take: number, skip: number;
    if (query.page && query.pageSize) {
      // Actually 'page' is string because it comes from URL param.
      const page = parseInt(query.page);
      const pageSize = parseInt(query.pageSize);
      if (page > 0 && pageSize > 0) {
        take = pageSize;
        skip = pageSize * (page - 1);
      } else {
        throw new BadRequestException(
          'The page and pageSize must be larger than 0.'
        );
      }
    } else {
      take = 10;
      skip = 0;
    }

    // [step 3] Get many.
    const [workflows, total] = await this.tcWorkflowService.findManyWithTotal({
      where: where,
      take: take,
      skip: skip,
    });

    for (let i = 0; i < workflows.length; i++) {
      const workflow = workflows[i];
      workflow['processedByUsers'] = [];
      for (let j = 0; j < workflow.processedByUserIds.length; j++) {
        const userId = workflow.processedByUserIds[j];
        const user = await this.userService.findUnique({where: {id: userId}});
        if (user) {
          workflow['processedByUsers'] = workflow['processedByUsers'].concat(
            user?.username
          );
        }
      }
    }

    return formatPaginationResponse({records: workflows, total, query});
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
        summary: 'Accept',
        value: {
          status: WorkflowStatus.Accepted,
        },
      },
      b: {
        summary: 'Reject',
        value: {
          status: WorkflowStatus.Rejected,
          reasonForRefusal: 'The reason why this request was rejected.',
        },
      },
      c: {
        summary: 'Pick up',
        value: {
          status: WorkflowStatus.PickedUp,
        },
      },
    },
  })
  async updateTcWorkflow(
    @Request() request: Request,
    @Param('workflowId') workflowId: string,
    @Body() body: Prisma.TcWorkflowUpdateInput
  ): Promise<TcWorkflow> {
    let canUpdate = false;
    let errMessage = '';
    const workflow = await this.tcWorkflowService.findUniqueOrThrow({
      where: {id: workflowId},
    });

    // [step 1] Guard statements.
    const newStatus = body.status;
    if (
      newStatus === WorkflowStatus.Accepted ||
      newStatus === WorkflowStatus.Rejected
    ) {
      if (workflow.status === WorkflowStatus.PendingReview) {
        canUpdate = true;
      } else if (
        workflow.status === WorkflowStatus.Accepted ||
        workflow.status === WorkflowStatus.Rejected
      ) {
        errMessage = 'It is not allowed to review since it has been reviewed.';
      } else {
        errMessage = 'It is not allowed to review since it is not completed.';
      }
    } else if (newStatus === WorkflowStatus.PickedUp) {
      if (workflow.status === WorkflowStatus.Accepted) {
        canUpdate = true;
      } else {
        errMessage =
          'It is not allowed to pick up since it has not been reviewed.';
      }
    }

    if (!canUpdate) {
      throw new BadRequestException(errMessage);
    }

    // [step 2] Update workflow.
    const {userId} = this.tokenService.decodeToken(
      this.tokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};

    const updateInput: Prisma.TcWorkflowUpdateInput = body;

    if (!workflow.processedByUserIds.includes(userId)) {
      updateInput.processedByUserIds =
        workflow.processedByUserIds.concat(userId);
    }

    return await this.tcWorkflowService.update({
      where: {id: workflowId},
      data: updateInput,
    });
  }

  @Delete(':workflowId')
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
