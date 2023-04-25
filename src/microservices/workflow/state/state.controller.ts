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
  private workflowStateService = new WorkflowStateService();

  @Post('')
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
    @Param('stateId') stateId: string
  ): Promise<WorkflowState | null> {
    return await this.workflowStateService.findUnique({
      where: {id: parseInt(stateId)},
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
    @Param('stateId') stateId: string,
    @Body()
    body: Prisma.WorkflowStateUpdateInput
  ): Promise<WorkflowState> {
    return await this.workflowStateService.update({
      where: {id: parseInt(stateId)},
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
    @Param('stateId') stateId: string
  ): Promise<WorkflowState> {
    return await this.workflowStateService.delete({
      where: {id: parseInt(stateId)},
    });
  }

  /* End */
}
