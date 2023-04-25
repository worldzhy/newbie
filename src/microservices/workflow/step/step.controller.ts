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
import {WorkflowStep, Prisma} from '@prisma/client';
import {WorkflowStepService} from './step.service';

@ApiTags('[Microservice] Workflow / Step')
@ApiBearerAuth()
@Controller('workflow-steps')
export class WorkflowStepController {
  private workflowStepService = new WorkflowStepService();

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
  async createWorkflowStep(
    @Body() body: Prisma.WorkflowStepUncheckedCreateInput
  ): Promise<WorkflowStep> {
    return await this.workflowStepService.create({
      data: body,
    });
  }

  @Get('')
  async getWorkflowSteps(): Promise<WorkflowStep[]> {
    return await this.workflowStepService.findMany({});
  }

  @Get(':stepId')
  @ApiParam({
    name: 'stepId',
    schema: {type: 'number'},
    description: 'The id of the workflow step.',
    example: 11,
  })
  async getWorkflowStep(
    @Param('stepId') stepId: string
  ): Promise<WorkflowStep | null> {
    return await this.workflowStepService.findUnique({
      where: {id: parseInt(stepId)},
    });
  }

  @Patch(':stepId')
  @ApiParam({
    name: 'stepId',
    schema: {type: 'number'},
    description: 'The id of the workflow step.',
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
  async updateWorkflowStep(
    @Param('stepId') stepId: string,
    @Body()
    body: Prisma.WorkflowStepUpdateInput
  ): Promise<WorkflowStep> {
    return await this.workflowStepService.update({
      where: {id: parseInt(stepId)},
      data: body,
    });
  }

  @Delete(':stepId')
  @ApiParam({
    name: 'stepId',
    schema: {type: 'number'},
    example: 11,
  })
  async deleteWorkflowStep(
    @Param('stepId') stepId: string
  ): Promise<WorkflowStep> {
    return await this.workflowStepService.delete({
      where: {id: parseInt(stepId)},
    });
  }

  /* End */
}
