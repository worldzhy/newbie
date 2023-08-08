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
import {
  WorkflowViewComponent,
  Prisma,
  WorkflowViewComponentType,
} from '@prisma/client';
import {WorkflowViewComponentService} from '../../microservices/workflow/workflow-view-component.service';

@ApiTags('Workflow / View / Component')
@ApiBearerAuth()
@Controller('workflow-view-components')
export class WorkflowViewComponentController {
  constructor(
    private readonly workflowViewComponentService: WorkflowViewComponentService
  ) {}

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
    return await this.workflowViewComponentService.createMany({
      data: body.data,
    });
  }

  @Get(':componentId')
  @ApiParam({
    name: 'componentId',
    schema: {type: 'number'},
    description: 'The id of the workflow view component.',
    example: 11,
  })
  async getWorkflowViewComponent(
    @Param('componentId') componentId: number
  ): Promise<WorkflowViewComponent | null> {
    return await this.workflowViewComponentService.findUnique({
      where: {id: componentId},
    });
  }

  @Patch(':componentId')
  @ApiParam({
    name: 'componentId',
    schema: {type: 'number'},
    description: 'The id of the workflow view component.',
    example: 11,
  })
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
    return await this.workflowViewComponentService.update({
      where: {id: componentId},
      data: body,
    });
  }

  @Delete(':componentId')
  @ApiParam({
    name: 'componentId',
    schema: {type: 'number'},
    example: 11,
  })
  async deleteWorkflowViewComponent(
    @Param('componentId') componentId: number
  ): Promise<WorkflowViewComponent> {
    return await this.workflowViewComponentService.delete({
      where: {id: componentId},
    });
  }

  /* End */
}
