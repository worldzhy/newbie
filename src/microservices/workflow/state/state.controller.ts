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
import {WorkflowState, Prisma, PermissionAction} from '@prisma/client';
import {RequirePermission} from '../../../applications/account/authorization/authorization.decorator';
import {WorkflowStateService} from './state.service';

@ApiTags('[Microservice] Workflow / State')
@ApiBearerAuth()
@Controller('workflow-states')
export class WorkflowStateController {
  private workflowStateService = new WorkflowStateService();

  @Post('')
  @RequirePermission(PermissionAction.create, Prisma.ModelName.WorkflowState)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          state: 'Pending',
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
  @RequirePermission(PermissionAction.read, Prisma.ModelName.WorkflowState)
  async getWorkflowStates(): Promise<WorkflowState[]> {
    return await this.workflowStateService.findMany({});
  }

  @Get(':stateId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.WorkflowState)
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
  @RequirePermission(PermissionAction.update, Prisma.ModelName.WorkflowState)
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
        summary: '1. Update',
        value: {
          state: 'Pending Test',
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
  @RequirePermission(PermissionAction.delete, Prisma.ModelName.WorkflowState)
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
