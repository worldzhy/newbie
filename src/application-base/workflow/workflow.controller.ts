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
import {Workflow, Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Workflow')
@ApiBearerAuth()
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly prisma: PrismaService) {}

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
    return await this.prisma.workflow.create({
      data: body,
    });
  }

  @Get('')
  async getWorkflows(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Workflow,
      pagination: {page, pageSize},
    });
  }

  @Get(':workflowId')
  async getWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<Workflow> {
    return await this.prisma.workflow.findUniqueOrThrow({
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
    return await this.prisma.workflow.update({
      where: {id: workflowId},
      data: body,
    });
  }

  @Delete(':workflowId')
  async deleteWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<Workflow> {
    return await this.prisma.workflow.delete({
      where: {id: workflowId},
    });
  }

  /* End */
}
