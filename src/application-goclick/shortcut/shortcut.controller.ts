import {Controller, Post, Body, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiResponse} from '@nestjs/swagger';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {ShortcutService} from '@microservices/shortcut/shortcut.service';

import {Prisma} from '@prisma/client';
import {
  ShortcutGroupCreateReqDto,
  ShortcutGroupUpdateReqDto,
  ShortcutItemCreateReqDto,
  ShortcutItemUpdateReqDto,
} from '@microservices/shortcut/shortcut.dto';
import {CommonCUDResDto} from '@framework/common.dto';
import {
  ShortcutGroupListReqDto,
  ShortcutGroupListResDto,
  ShortcutItemListReqDto,
  ShortcutItemListResDto,
  ShortcutTreeResDto,
} from './shortcut.dto';

@ApiTags('Shortcut')
@ApiBearerAuth()
@Controller('shortcut')
export class ShortcutController {
  constructor(
    private shortcutService: ShortcutService,
    private readonly prisma: PrismaService
  ) {}

  @NoGuard()
  @Get('group/list')
  @ApiResponse({
    type: ShortcutGroupListResDto,
  })
  async groupList(@Query() query: ShortcutGroupListReqDto) {
    const {page, pageSize, id} = query;
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.ShortcutGroup,
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
    body: ShortcutGroupCreateReqDto
  ) {
    return await this.shortcutService.groupCreate(body);
  }

  @NoGuard()
  @Post('group/update')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async groupUpdate(
    @Body()
    body: ShortcutGroupUpdateReqDto
  ) {
    return await this.shortcutService.groupUpdate(body);
  }

  @NoGuard()
  @Post('group/delete')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async groupDelete(
    @Body()
    body: ShortcutGroupUpdateReqDto
  ) {
    return await this.shortcutService.groupDelete(body);
  }

  @NoGuard()
  @Get('item/list')
  @ApiResponse({
    type: ShortcutItemListResDto,
  })
  async itemList(@Query() query: ShortcutItemListReqDto) {
    const {page, pageSize, id, ...rest} = query;
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.ShortcutItem,
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
    type: ShortcutTreeResDto,
    isArray: true,
  })
  async tree() {
    const groups = await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.ShortcutGroup,
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
      model: Prisma.ModelName.ShortcutItem,
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
    body: ShortcutItemCreateReqDto
  ) {
    return await this.shortcutService.itemCreate(body);
  }

  @NoGuard()
  @Post('item/update')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async itemUpdate(
    @Body()
    body: ShortcutItemUpdateReqDto
  ) {
    return await this.shortcutService.itemUpdate(body);
  }

  @NoGuard()
  @Post('item/delete')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async itemDelete(
    @Body()
    body: ShortcutItemUpdateReqDto
  ) {
    return await this.shortcutService.itemDelete(body);
  }
}
