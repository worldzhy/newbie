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
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {WorkflowView, Prisma} from '@prisma/client';
import {WorkflowViewService} from '@microservices/workflow/workflow-view.service';

@ApiTags('Workflow / View')
@ApiBearerAuth()
@Controller('workflow-views')
export class WorkflowViewController {
  constructor(private readonly workflowViewService: WorkflowViewService) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Admin',
          workflowId: 'd8141ece-f242-4288-a60a-8675538549cd',
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

  @Get('start-views')
  async getWorkflowStartViews(@Query('workflowId') workflowId?: string) {
    return await this.workflowViewService.findMany({
      where: {workflowId: workflowId, inboundRoutes: {some: {startSign: true}}},
      include: {
        components: {orderBy: {sort: 'asc'}},
        inboundRoutes: {include: {state: true}},
        outboundRoutes: {include: {state: true}},
      },
    });
  }

  @Get(':viewId')
  async getWorkflowView(
    @Param('viewId') viewId: number
  ): Promise<WorkflowView> {
    return await this.workflowViewService.findUniqueOrThrow({
      where: {id: viewId},
      include: {
        components: {orderBy: {sort: 'asc'}},
        inboundRoutes: {include: {state: true}},
        outboundRoutes: {include: {state: true}},
      },
    });
  }

  @Patch(':viewId')
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
    @Param('viewId') viewId: number,
    @Body()
    body: Prisma.WorkflowViewUpdateInput
  ): Promise<WorkflowView> {
    return await this.workflowViewService.update({
      where: {id: viewId},
      data: body,
    });
  }

  @Delete(':viewId')
  async deleteWorkflowView(
    @Param('viewId') viewId: number
  ): Promise<WorkflowView> {
    return await this.workflowViewService.delete({
      where: {id: viewId},
    });
  }

  /* End */
}
