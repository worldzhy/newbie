import {
  Controller,
  Delete,
  Get,
  Patch,
  Body,
  Param,
  BadRequestException,
  Query,
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
import {RoleService} from '../../../account/user/role/role.service';
import {UserService} from '../../../account/user/user.service';
import {formatPaginationResponse} from 'src/toolkits/format/pagination.format';

@ApiTags('[Application] Tc Request / Workflow / Officer')
@ApiBearerAuth()
@Controller('officer-workflows')
export class OfficerWorkflowController {
  private userService = new UserService();
  private roleService = new RoleService();
  private tcWorkflowService = new TcWorkflowService();

  @Get('statuses')
  async getTcWorkflowStatuses() {
    return Object.values(WorkflowStatus);
  }

  @Get('')
  @ApiQuery({name: 'status', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getTcWorkflows(
    @Query()
    query: {
      status?: string;
      page?: string;
      pageSize?: string;
    }
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.UserWhereInput | undefined;
    const whereConditions: object[] = [];
    if (query.status) {
      const status = query.status.trim();
      if (status.length > 0) {
        whereConditions.push({status: status});
      }
    }

    if (whereConditions.length > 1) {
      where = {OR: whereConditions};
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

    // [step 3] Get users.
    const [users, total] = await this.tcWorkflowService.findManyWithTotal({
      where: where,
      take: take,
      skip: skip,
    });

    return formatPaginationResponse({records: users, total, query});
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
    @Param('workflowId') workflowId: string,
    @Body() body: Prisma.TcWorkflowUpdateInput
  ): Promise<TcWorkflow> {
    const existed = await this.tcWorkflowService.checkExistence({
      where: {id: workflowId, status: WorkflowStatus.PendingReview},
    });

    if (existed) {
      return await this.tcWorkflowService.update({
        where: {id: workflowId},
        data: body,
      });
    } else {
      throw new BadRequestException(
        'This request is not allowed to review since it is not completed.'
      );
    }
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
