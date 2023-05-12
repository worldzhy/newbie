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
import {WorkflowRoute, Prisma, PermissionAction} from '@prisma/client';
import {RequirePermission} from '../../../applications/account/authorization/authorization.decorator';
import {WorkflowRouteService} from './route.service';
import {Public} from '../../../applications/account/authentication/public/public.decorator';

@ApiTags('[Microservice] Workflow / Route')
@ApiBearerAuth()
@Public()
@Controller('workflow-routes')
export class WorkflowRouteController {
  private workflowRouteService = new WorkflowRouteService();

  @Post('')
  @RequirePermission(PermissionAction.create, Prisma.ModelName.WorkflowRoute)
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Admin',
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
  @RequirePermission(PermissionAction.read, Prisma.ModelName.WorkflowRoute)
  @ApiQuery({name: 'view', type: 'string'})
  async getWorkflowRoutes(
    @Query() query: {view?: string}
  ): Promise<WorkflowRoute[]> {
    // [step 1] Construct where argument.
    let where: Prisma.WorkflowRouteWhereInput | undefined;
    if (query.view) {
      where = {view: query.view};
    }

    // [step 2] Get workflows.
    return await this.workflowRouteService.findMany({where: where});
  }

  @Get(':routeId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.WorkflowRoute)
  @ApiParam({
    name: 'routeId',
    schema: {type: 'number'},
    description: 'The id of the workflow.',
    example: 11,
  })
  async getWorkflowRoute(
    @Param('routeId') routeId: string
  ): Promise<WorkflowRoute | null> {
    return await this.workflowRouteService.findUnique({
      where: {id: parseInt(routeId)},
    });
  }

  @Patch(':routeId')
  @RequirePermission(PermissionAction.update, Prisma.ModelName.WorkflowRoute)
  @ApiParam({
    name: 'routeId',
    schema: {type: 'number'},
    description: 'The id of the workflow.',
    example: 11,
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          name: 'InceptionPad Inc',
        },
      },
    },
  })
  async updateWorkflowRoute(
    @Param('routeId') routeId: string,
    @Body()
    body: Prisma.WorkflowRouteUpdateInput
  ): Promise<WorkflowRoute> {
    return await this.workflowRouteService.update({
      where: {id: parseInt(routeId)},
      data: body,
    });
  }

  @Delete(':routeId')
  @RequirePermission(PermissionAction.delete, Prisma.ModelName.WorkflowRoute)
  @ApiParam({
    name: 'routeId',
    schema: {type: 'number'},
    example: 11,
  })
  async deleteWorkflowRoute(
    @Param('routeId') routeId: string
  ): Promise<WorkflowRoute> {
    return await this.workflowRouteService.delete({
      where: {id: parseInt(routeId)},
    });
  }

  /* End */
}
