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
  WorkflowViewComponentSubType,
} from '@prisma/client';
import {WorkflowViewComponentService} from './component.service';

@ApiTags('[Microservice] Workflow / View Component')
@ApiBearerAuth()
@Controller('workflow-view-components')
export class WorkflowViewComponentController {
  constructor(
    private readonly workflowViewComponentService: WorkflowViewComponentService
  ) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          type: WorkflowViewComponentType.Static,
          subType: WorkflowViewComponentSubType.Static_Text,
          properties: {},
          viewId: 1,
        },
      },
    },
  })
  async createWorkflowViewComponent(
    @Body() body: Prisma.WorkflowViewComponentUncheckedCreateInput
  ): Promise<WorkflowViewComponent> {
    return await this.workflowViewComponentService.create({
      data: body,
    });
  }

  @Get('')
  async getWorkflowViewComponents(): Promise<WorkflowViewComponent[]> {
    return await this.workflowViewComponentService.findMany({});
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
        summary: '1. Update name',
        value: {
          name: 'InceptionPad Inc',
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
