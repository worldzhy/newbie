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
import {GoClickStatus} from '@microservices/go-click/constants';
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
}
