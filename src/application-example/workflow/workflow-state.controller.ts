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
import {WorkflowState, Prisma} from '@prisma/client';
import {WorkflowStateService} from '@microservices/workflow/workflow-state.service';

@ApiTags('Workflow / State')
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
  async getWorkflowStates(@Query('workflowId') workflowId?: string) {
    return await this.workflowStateService.findManyInOnePage({
      where: {workflowId},
    });
  }

  @Patch(':stateId')
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
  async deleteWorkflowState(
    @Param('stateId') stateId: number
  ): Promise<WorkflowState> {
    return await this.workflowStateService.delete({
      where: {id: stateId},
    });
  }

  /* End */
}
