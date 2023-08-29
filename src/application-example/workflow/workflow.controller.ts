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
import {Workflow, Prisma} from '@prisma/client';
import {WorkflowService} from '@microservices/workflow/workflow.service';

@ApiTags('Workflow')
@ApiBearerAuth()
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

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
  async createWorkflow(
    @Body() body: Prisma.WorkflowUncheckedCreateInput
  ): Promise<Workflow> {
    return await this.workflowService.create({
      data: body,
    });
  }

  @Get('')
  async getWorkflows(): Promise<Workflow[]> {
    return await this.workflowService.findMany({});
  }

  @Get(':workflowId')
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'string'},
    description: 'The id of the workflow.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<Workflow> {
    return await this.workflowService.findUniqueOrThrow({
      where: {id: workflowId},
      include: {views: true, states: true},
    });
  }

  @Patch(':workflowId')
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'string'},
    description: 'The id of the workflow.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
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
  async updateWorkflow(
    @Param('workflowId') workflowId: string,
    @Body()
    body: Prisma.WorkflowUpdateInput
  ): Promise<Workflow> {
    return await this.workflowService.update({
      where: {id: workflowId},
      data: body,
    });
  }

  @Delete(':workflowId')
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'string'},
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<Workflow> {
    return await this.workflowService.delete({
      where: {id: workflowId},
    });
  }

  /* End */
}
