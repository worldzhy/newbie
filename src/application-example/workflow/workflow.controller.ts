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
  async getWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<Workflow> {
    return await this.workflowService.findUniqueOrThrow({
      where: {id: workflowId},
      include: {views: true, states: true},
    });
  }

  @Patch(':workflowId')
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
  async deleteWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<Workflow> {
    return await this.workflowService.delete({
      where: {id: workflowId},
    });
  }

  /* End */
}
