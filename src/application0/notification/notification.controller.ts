import {Controller, Post, Body, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody, ApiResponse} from '@nestjs/swagger';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma} from '@prisma/client';
import {NotificationService} from '@microservices/notification/notification.service';
import {
  NotificationAccessKeyCreateReqDto,
  NotificationAccessKeyUpdateReqDto,
} from '@microservices/notification/notification.dto';
import {CommonCUDResDto} from '@/dto/common';
import {
  NotificationAccessKeyListReqDto,
  NotificationAccessKeyListResDto,
} from './notification.dto';

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    private readonly prisma: PrismaService
  ) {}

  @Get('accessKey/list')
  @ApiResponse({
    type: NotificationAccessKeyListResDto,
  })
  async accessKeyList(@Query() query: NotificationAccessKeyListReqDto) {
    const {page, pageSize, id} = query;
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.NotificationAccessKey,
      pagination: {page, pageSize},
      findManyArgs: {
        where: {
          deletedAt: null,
          id,
        },
      },
    });
  }

  @Post('accessKey/create')
  @ApiBody({
    type: NotificationAccessKeyCreateReqDto,
  })
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async accessKeyCreate(
    @Body()
    body: NotificationAccessKeyCreateReqDto
  ) {
    return await this.notificationService.accessKeyCreate(body);
  }

  @Post('accessKey/update')
  @ApiBody({
    type: NotificationAccessKeyUpdateReqDto,
  })
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async accessKeyUpdate(
    @Body()
    body: NotificationAccessKeyUpdateReqDto
  ) {
    return await this.notificationService.accessKeyUpdate(body);
  }

  @Post('accessKey/delete')
  @ApiBody({
    type: NotificationAccessKeyUpdateReqDto,
  })
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async accessKeyDelete(
    @Body()
    body: NotificationAccessKeyUpdateReqDto
  ) {
    return await this.notificationService.accessKeyDelete(body);
  }
}
