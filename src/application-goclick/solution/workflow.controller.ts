import {Controller, Post} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';

@ApiTags('Solution')
@ApiBearerAuth()
@Controller('solution')
export class SolutionWorkflowController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('init-workflow-example')
  @NoGuard()
  async initWorkflowExample() {
    const old = await this.prisma.workflow.findFirst({
      where: {name: 'Example'},
    });
    if (old) {
      await this.prisma.workflow.delete({
        where: {id: old.id},
      });
    }
    const example = await await this.prisma.workflow.create({
      data: {
        name: 'Example',
        description: 'Example workflow',
      },
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
}
