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
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
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
    const {page, pageSize} = query;
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

  @Post('initExample')
  @NoGuard()
  async initExample() {
    await this.prisma.workflow.delete({
      where: {name: 'Example'},
    });
    const example = await this.createWorkflow({
      name: 'Example',
      description: 'Example workflow',
    });
    const views: any = [
      {
        name: 'Node Root',
        workflowId: example.id,
      },
      {
        name: 'Node 1',
        workflowId: example.id,
      },
      {
        name: 'Node 2',
        workflowId: example.id,
      },
      {
        name: 'Node 3',
        workflowId: example.id,
      },
      {
        name: 'Node 4',
        workflowId: example.id,
      },
    ];
    for (let i = 0; i < views.length; i++) {
      const workflowView = await this.prisma.workflowView.create({
        data: views[i],
      });
      views[i].id = workflowView.id;
    }

    const comps: any = [
      {
        viewId: views[0].id,
        type: 'INFO_Title',
        properties: {value: 'This is Node Root'},
        sort: 0,
      },
      {
        viewId: views[1].id,
        type: 'INFO_Title',
        properties: {value: 'This is Node 1'},
        sort: 0,
      },
      {
        viewId: views[2].id,
        type: 'INFO_Title',
        properties: {value: 'This is Node 2'},
        sort: 0,
      },
      {
        viewId: views[3].id,
        type: 'INFO_Title',
        properties: {value: 'This is Node 3'},
        sort: 0,
      },
      {
        viewId: views[4].id,
        type: 'INFO_Title',
        properties: {value: 'This is Node 4'},
        sort: 0,
      },
    ];

    for (let i = 0; i < comps.length; i++) {
      const comp = await this.prisma.workflowViewComponent.create({
        data: comps[i],
      });
      comps[i].id = comp.id;
    }

    const workflowStateNext = await this.prisma.workflowState.create({
      data: {
        workflowId: example.id,
        name: 'Next',
        description: 'to next',
      },
    });
    const workflowStateBack = await this.prisma.workflowState.create({
      data: {
        workflowId: example.id,
        name: 'Back Root',
        description: 'back root',
      },
    });

    await this.prisma.workflowRoute.createMany({
      data: [
        // root -> node 1
        {
          startSign: true,
          viewId: views[0].id,
          stateId: workflowStateNext.id,
          nextViewId: views[1].id,
        },
        // node 1  -> node 2
        {
          startSign: false,
          viewId: views[1].id,
          stateId: workflowStateNext.id,
          nextViewId: views[2].id,
        },
        // node 2 -> node 3
        {
          startSign: false,
          viewId: views[2].id,
          stateId: workflowStateNext.id,
          nextViewId: views[3].id,
        },
        // node 3 -> node 4
        {
          startSign: false,
          viewId: views[3].id,
          stateId: workflowStateNext.id,
          nextViewId: views[4].id,
        },
        // root <- node 4
        {
          startSign: false,
          viewId: views[4].id,
          stateId: workflowStateBack.id,
          nextViewId: views[0].id,
        },
      ],
    });
  }

  /* End */
}
