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
import {ApiTags, ApiBearerAuth, ApiBody, ApiResponse} from '@nestjs/swagger';
import {Workflow, Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  WorkflowListReqDto,
  WorkflowListResDto,
  WorkflowDetailResDto,
  WorkflowCreateReqDto,
  WorkflowUpdateReqDto,
} from './dto/workflow.dto';

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
    type: WorkflowCreateReqDto,
  })
  @ApiResponse({
    type: WorkflowDetailResDto,
  })
  async createWorkflow(
    @Body() body: WorkflowCreateReqDto
  ): Promise<WorkflowDetailResDto> {
    return await this.prisma.workflow.create({
      data: body,
    });
  }

  @Get('')
  @ApiResponse({
    type: WorkflowListResDto,
  })
  async getWorkflows(
    @Query() query: WorkflowListReqDto
  ): Promise<WorkflowListResDto> {
    const {page, pageSize, ...rest} = query;
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Workflow,
      pagination: {page, pageSize},
      findManyArgs: {
        where: {...rest},
      },
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
    type: WorkflowUpdateReqDto,
  })
  @ApiResponse({
    type: WorkflowDetailResDto,
  })
  async updateWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() body: WorkflowUpdateReqDto
  ): Promise<WorkflowDetailResDto> {
    return await this.prisma.workflow.update({
      where: {id: workflowId},
      data: body,
    });
  }

  @Delete(':workflowId')
  @ApiResponse({
    type: WorkflowDetailResDto,
  })
  async deleteWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<Workflow> {
    return await this.prisma.workflow.delete({
      where: {id: workflowId},
    });
  }

  /* End */
}
