import {Controller, Post, Body, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiResponse} from '@nestjs/swagger';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma} from '@prisma/client';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {GoClickService} from '@microservices/go-click/go-click.service';
import {
  GoClickGroupCreateReqDto,
  GoClickGroupUpdateReqDto,
  GoClickItemCreateReqDto,
  GoClickItemUpdateReqDto,
} from '@microservices/go-click/go-click.dto';
import {CommonCUDResDto} from '@/dto/common';
import {
  GoClickGroupListReqDto,
  GoClickGroupListResDto,
  GoClickItemListReqDto,
  GoClickItemListResDto,
  GoClickTreeResDto,
} from './go-click.dto';

@ApiTags('GoClick')
@ApiBearerAuth()
@Controller('go-click')
export class GoClickController {
  constructor(
    private goClickService: GoClickService,
    private readonly prisma: PrismaService
  ) {}

  @NoGuard()
  @Get('group/list')
  @ApiResponse({
    type: GoClickGroupListResDto,
  })
  async groupList(@Query() query: GoClickGroupListReqDto) {
    const {page, pageSize, id} = query;
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.GoClickGroup,
      pagination: {page, pageSize},
      findManyArgs: {
        where: {
          deletedAt: null,
          id,
        },
        orderBy: {
          sort: 'desc',
        },
      },
    });
  }

  @NoGuard()
  @Post('group/create')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async groupCreate(
    @Body()
    body: GoClickGroupCreateReqDto
  ) {
    return await this.goClickService.groupCreate(body);
  }

  @NoGuard()
  @Post('group/update')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async groupUpdate(
    @Body()
    body: GoClickGroupUpdateReqDto
  ) {
    return await this.goClickService.groupUpdate(body);
  }

  @NoGuard()
  @Post('group/delete')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async groupDelete(
    @Body()
    body: GoClickGroupUpdateReqDto
  ) {
    return await this.goClickService.groupDelete(body);
  }

  @NoGuard()
  @Get('item/list')
  @ApiResponse({
    type: GoClickItemListResDto,
  })
  async itemList(@Query() query: GoClickItemListReqDto) {
    const {page, pageSize, id, ...rest} = query;
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.GoClickItem,
      pagination: {page, pageSize},
      findManyArgs: {
        where: {
          deletedAt: null,
          id,
          ...rest,
        },
        orderBy: {
          sort: 'desc',
        },
      },
    });
  }

  @NoGuard()
  @Get('tree')
  @ApiResponse({
    type: GoClickTreeResDto,
    isArray: true,
  })
  async tree() {
    const groups = await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.GoClickGroup,
      pagination: {page: 0, pageSize: 10000},
      findManyArgs: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          sort: 'desc',
        },
      },
    });
    const items = await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.GoClickItem,
      pagination: {page: 0, pageSize: 1000},
      findManyArgs: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          sort: 'desc',
        },
      },
    });

    const groupMap = {};

    groups.records.forEach(groupItem => {
      groupMap[groupItem.id] = {...groupItem, items: [], child: []};
    });
    items.records.forEach(itemItem => {
      if (groupMap[itemItem.groupId]) {
        groupMap[itemItem.groupId].items.push(itemItem);
      }
    });

    Object.keys(groupMap).forEach(groupId => {
      if (groupMap[groupId].parentId !== 0) {
        groupMap[groupMap[groupId].parentId].child.push(groupMap[groupId]);
      }
    });

    return Object.keys(groupMap)
      .map(groupId => groupMap[groupId])
      .filter(group => group.parentId === 0);
  }

  @NoGuard()
  @Post('item/create')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async itemCreate(
    @Body()
    body: GoClickItemCreateReqDto
  ) {
    return await this.goClickService.itemCreate(body);
  }

  @NoGuard()
  @Post('item/update')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async itemUpdate(
    @Body()
    body: GoClickItemUpdateReqDto
  ) {
    return await this.goClickService.itemUpdate(body);
  }

  @NoGuard()
  @Post('item/delete')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async itemDelete(
    @Body()
    body: GoClickItemUpdateReqDto
  ) {
    return await this.goClickService.itemDelete(body);
  }

  @Post('init-google-drive-example')
  @NoGuard()
  async initGoogleDriveExample() {
    return await this.goClickService.initGoogleDriveExample();
  }

  @Post('init-workflow-example')
  @NoGuard()
  async initWorkflowExample() {
    await this.prisma.workflow.delete({
      where: {name: 'Example'},
    });
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
