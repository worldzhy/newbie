import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {WorkflowRoute, Prisma} from '@prisma/client';
import {WorkflowRouteService} from '../../../microservices/workflow/workflow-route.service';

@ApiTags('Samples: Workflow / Route')
@ApiBearerAuth()
@Controller('workflow-routes')
export class WorkflowRouteController {
  constructor(private readonly workflowRouteService: WorkflowRouteService) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          viewId: 1,
          stateId: 1,
          nextViewId: 2,
          workflowId: 'd8141ece-f242-4288-a60a-8675538549cd',
        },
      },
    },
  })
  async createWorkflowRoute(
    @Body() body: Prisma.WorkflowRouteUncheckedCreateInput
  ): Promise<WorkflowRoute> {
    return await this.workflowRouteService.create({
      data: body,
    });
  }

  @Get('')
  @ApiQuery({name: 'viewId', type: 'number'})
  async getWorkflowRoutes(
    @Query('viewId') viewId?: number
  ): Promise<WorkflowRoute[]> {
    // [step 1] Construct where argument.
    let where: Prisma.WorkflowRouteWhereInput | undefined;
    if (viewId) {
      where = {viewId: viewId};
    }

    // [step 2] Get workflows.
    return await this.workflowRouteService.findMany({where: where});
  }

  @Get(':routeId')
  @ApiParam({
    name: 'routeId',
    schema: {type: 'number'},
    description: 'The id of the workflow route.',
    example: 11,
  })
  async getWorkflowRoute(
    @Param('routeId') routeId: number
  ): Promise<WorkflowRoute | null> {
    return await this.workflowRouteService.findUnique({
      where: {id: routeId},
    });
  }

  @Patch(':routeId')
  @ApiParam({
    name: 'routeId',
    schema: {type: 'number'},
    description: 'The id of the workflow route.',
    example: 11,
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update route',
        value: {
          viewId: 1,
          stateId: 1,
          nextViewId: 3,
        },
      },
      b: {
        summary: '2. Update start sign',
        value: {
          startSign: true,
        },
      },
    },
  })
  async updateWorkflowRoute(
    @Param('routeId') routeId: number,
    @Body()
    body: Prisma.WorkflowRouteUpdateInput
  ): Promise<WorkflowRoute> {
    if (body.startSign && body.startSign === true) {
      this.workflowRouteService.updateMany({
        data: {startSign: null},
      });
    }

    return await this.workflowRouteService.update({
      where: {id: routeId},
      data: body,
    });
  }

  @Delete(':routeId')
  @ApiParam({
    name: 'routeId',
    schema: {type: 'number'},
    example: 11,
  })
  async deleteWorkflowRoute(
    @Param('routeId') routeId: number
  ): Promise<WorkflowRoute> {
    return await this.workflowRouteService.delete({
      where: {id: routeId},
    });
  }

  /* End */
}