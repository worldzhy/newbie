import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {WorkflowView, Prisma, PermissionAction} from '@prisma/client';
import {RequirePermission} from '../../../applications/account/authorization/authorization.decorator';
import {WorkflowViewService} from './view.service';
import {Public} from '../../../applications/account/authentication/public/public.decorator';

@ApiTags('[Microservice] Workflow / View')
@ApiBearerAuth()
@Public()
@Controller('workflow-views')
export class WorkflowViewController {
  private workflowViewService = new WorkflowViewService();

  @Post('')
  @RequirePermission(PermissionAction.create, Prisma.ModelName.WorkflowView)
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
  async createWorkflowView(
    @Body() body: Prisma.WorkflowViewUncheckedCreateInput
  ): Promise<WorkflowView> {
    return await this.workflowViewService.create({
      data: body,
    });
  }

  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.WorkflowView)
  async getWorkflowViews(): Promise<WorkflowView[]> {
    return await this.workflowViewService.findMany({});
  }

  @Get(':viewId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.WorkflowView)
  @ApiParam({
    name: 'viewId',
    schema: {type: 'number'},
    description: 'The id of the workflow view.',
    example: 11,
  })
  async getWorkflowView(
    @Param('viewId') viewId: string
  ): Promise<WorkflowView | null> {
    return await this.workflowViewService.findUnique({
      where: {id: parseInt(viewId)},
    });
  }

  @Patch(':viewId')
  @RequirePermission(PermissionAction.update, Prisma.ModelName.WorkflowView)
  @ApiParam({
    name: 'viewId',
    schema: {type: 'number'},
    description: 'The id of the workflow view.',
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
  async updateWorkflowView(
    @Param('viewId') viewId: string,
    @Body()
    body: Prisma.WorkflowViewUpdateInput
  ): Promise<WorkflowView> {
    return await this.workflowViewService.update({
      where: {id: parseInt(viewId)},
      data: body,
    });
  }

  @Delete(':viewId')
  @RequirePermission(PermissionAction.delete, Prisma.ModelName.WorkflowView)
  @ApiParam({
    name: 'viewId',
    schema: {type: 'number'},
    example: 11,
  })
  async deleteWorkflowView(
    @Param('viewId') viewId: string
  ): Promise<WorkflowView> {
    return await this.workflowViewService.delete({
      where: {id: parseInt(viewId)},
    });
  }

  /* End */
}
