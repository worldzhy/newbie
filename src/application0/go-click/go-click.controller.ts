import {Controller, Post, Body, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiResponse} from '@nestjs/swagger';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma} from '@prisma/client';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {GoClickService} from '@microservices/go-click/go-click.service';
import {
  GoClickGroupCreateReqDto,
  GoClickGroupUpdateReqDto,
  GoClickLinkCreateReqDto,
  GoClickLinkUpdateReqDto,
} from '@microservices/go-click/go-click.dto';
import {GoClickStatus} from '@microservices/go-click/constants';
import {CommonCUDResDto} from '@/dto/common';
import {
  GoClickGroupListReqDto,
  GoClickGroupListResDto,
  GoClickLinkListReqDto,
  GoClickLinkListResDto,
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
  @Get('link/list')
  @ApiResponse({
    type: GoClickLinkListResDto,
  })
  async linkList(@Query() query: GoClickLinkListReqDto) {
    const {page, pageSize, id, ...rest} = query;
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.GoClickLink,
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
  @Get('link/show')
  @ApiResponse({
    type: GoClickLinkListResDto,
  })
  async linkShow() {
    const groups = await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.GoClickGroup,
      pagination: {page: 0, pageSize: 10000},
      findManyArgs: {
        where: {
          deletedAt: null,
          status: GoClickStatus.Active,
        },
        orderBy: {
          sort: 'desc',
        },
      },
    });
    const links = await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.GoClickLink,
      pagination: {page: 0, pageSize: 1000},
      findManyArgs: {
        where: {
          deletedAt: null,
          status: GoClickStatus.Active,
        },
        orderBy: {
          sort: 'desc',
        },
      },
    });

    const groupMap = {};

    groups.records.forEach(groupItem => {
      groupMap[groupItem.id] = {...groupItem, links: [], child: []};
    });
    links.records.forEach(linkItem => {
      if (groupMap[linkItem.groupId]) {
        groupMap[linkItem.groupId].links.push(linkItem);
      }
    });

    Object.keys(groupMap).forEach(groupId => {
      if (groupMap[groupId].parentId !== 0) {
        groupMap[groupMap[groupId].parentId].child.push(groupMap[groupId]);
      }
    });

    return Object.keys(groupMap).map(groupId => groupMap[groupId]);
  }

  @NoGuard()
  @Post('link/create')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async linkCreate(
    @Body()
    body: GoClickLinkCreateReqDto
  ) {
    return await this.goClickService.linkCreate(body);
  }

  @NoGuard()
  @Post('link/update')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async linkUpdate(
    @Body()
    body: GoClickLinkUpdateReqDto
  ) {
    return await this.goClickService.linkUpdate(body);
  }

  @NoGuard()
  @Post('link/delete')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async linkDelete(
    @Body()
    body: GoClickLinkUpdateReqDto
  ) {
    return await this.goClickService.linkDelete(body);
  }
}
