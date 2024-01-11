import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {
  WorkflowViewComponent,
  Prisma,
  WorkflowViewComponentType,
} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Workflow / View / Component')
@ApiBearerAuth()
@Controller('workflow-view-components')
export class WorkflowViewComponentController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('types')
  async listWorkflowViewComponentTypes() {
    return Object.keys(WorkflowViewComponentType);
  }

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          data: [
            {
              type: WorkflowViewComponentType.INFO_Title,
              sort: 1,
              properties: {},
              viewId: 1,
            },
            {
              type: WorkflowViewComponentType.INFO_Description,
              sort: 2,
              properties: {},
              viewId: 1,
            },
          ],
        },
      },
    },
  })
  async createWorkflowViewComponents(
    @Body() body: Prisma.WorkflowViewComponentCreateManyArgs
  ) {
    return await this.prisma.workflowViewComponent.createMany({
      data: body.data,
    });
  }

  @Get(':componentId')
  async getWorkflowViewComponent(
    @Param('componentId') componentId: number
  ): Promise<WorkflowViewComponent> {
    return await this.prisma.workflowViewComponent.findUniqueOrThrow({
      where: {id: componentId},
    });
  }

  @Patch(':componentId')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          type: WorkflowViewComponentType.INFO_Description,
          sort: 2,
          properties: {},
          viewId: 1,
        },
      },
    },
  })
  async updateWorkflowViewComponent(
    @Param('componentId') componentId: number,
    @Body()
    body: Prisma.WorkflowViewComponentUpdateInput
  ): Promise<WorkflowViewComponent> {
    return await this.prisma.workflowViewComponent.update({
      where: {id: componentId},
      data: body,
    });
  }

  @Delete(':componentId')
  async deleteWorkflowViewComponent(
    @Param('componentId') componentId: number
  ): Promise<WorkflowViewComponent> {
    return await this.prisma.workflowViewComponent.delete({
      where: {id: componentId},
    });
  }

  /* End */
}
