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
import {WorkflowRouteService} from '@microservices/workflow/workflow-route.service';

@ApiTags('Workflow / Route')
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
  @ApiQuery({name: 'workflowId', type: 'string'})
  async getWorkflowRoutes(
    @Query('workflowId') workflowId: string
  ): Promise<WorkflowRoute[]> {
    return await this.workflowRouteService.findMany({
      where: {view: {workflowId}},
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
