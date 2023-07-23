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
import {WorkflowState, Prisma} from '@prisma/client';
import {WorkflowStateService} from './state.service';

@ApiTags('[Microservice] Workflow / State')
@ApiBearerAuth()
@Controller('workflow-states')
export class WorkflowStateController {
  constructor(private readonly workflowStateService: WorkflowStateService) {}

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
  async createWorkflowState(
    @Body() body: Prisma.WorkflowStateUncheckedCreateInput
  ): Promise<WorkflowState> {
    return await this.workflowStateService.create({
      data: body,
    });
  }

  @Get('')
  async getWorkflowStates(): Promise<WorkflowState[]> {
    return await this.workflowStateService.findMany({});
  }

  @Get(':stateId')
  @ApiParam({
    name: 'stateId',
    schema: {type: 'number'},
    description: 'The id of the workflow state.',
    example: 11,
  })
  async getWorkflowState(
    @Param('stateId') stateId: number
  ): Promise<WorkflowState | null> {
    return await this.workflowStateService.findUnique({
      where: {id: stateId},
    });
  }

  @Patch(':stateId')
  @ApiParam({
    name: 'stateId',
    schema: {type: 'number'},
    description: 'The id of the workflow state.',
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
  async updateWorkflowState(
    @Param('stateId') stateId: number,
    @Body()
    body: Prisma.WorkflowStateUpdateInput
  ): Promise<WorkflowState> {
    return await this.workflowStateService.update({
      where: {id: stateId},
      data: body,
    });
  }

  @Delete(':stateId')
  @ApiParam({
    name: 'stateId',
    schema: {type: 'number'},
    example: 11,
  })
  async deleteWorkflowState(
    @Param('stateId') stateId: number
  ): Promise<WorkflowState> {
    return await this.workflowStateService.delete({
      where: {id: stateId},
    });
  }

  /* End */
}
