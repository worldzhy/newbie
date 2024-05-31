import {Controller, Post, Body, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody, ApiResponse} from '@nestjs/swagger';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma} from '@prisma/client';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {
  FeishuWebhookService,
  NotificationFeishuWebhookReqDto,
} from '@microservices/notification/webhook/feishu/feishu-webhook.service';
import {NotificationWebhookService} from '@microservices/notification/webhook/webhook.service';
import {
  NotificationWebhookChannelCreateReqDto,
  NotificationWebhookChannelUpdateReqDto,
} from '@microservices/notification/webhook/webhook.dto';
import {
  NotificationWebhookChannelListReqDto,
  NotificationWebhookChannelListResDto,
  NotificationWebhookRecordListReqDto,
  NotificationWebhookRecordListResDto,
} from './webhook.dto';

@ApiTags('Notification/Webhook')
@ApiBearerAuth()
@Controller('notification/webhook')
export class NotificationWebhookController {
  private loggerContext = 'NotificationWebhook';

  constructor(
    private feishuWebhookService: FeishuWebhookService,
    private notificationWebhookService: NotificationWebhookService,
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService
  ) {}

  @Post('channel/create')
  @ApiBody({
    type: NotificationWebhookChannelCreateReqDto,
  })
  async channelCreate(
    @Body()
    body: NotificationWebhookChannelCreateReqDto
  ) {
    return await this.notificationWebhookService.channelCreate(body);
  }

  @Post('channel/update')
  @ApiBody({
    type: NotificationWebhookChannelUpdateReqDto,
  })
  async channelUpdate(
    @Body()
    body: NotificationWebhookChannelUpdateReqDto
  ) {
    return await this.notificationWebhookService.channelUpdate(body);
  }

  @Post('channel/delete')
  @ApiBody({
    type: NotificationWebhookChannelUpdateReqDto,
  })
  async channelDelete(
    @Body()
    body: NotificationWebhookChannelUpdateReqDto
  ) {
    return await this.notificationWebhookService.channelDelete(body);
  }

  @Get('channel/list')
  @ApiResponse({
    type: NotificationWebhookChannelListResDto,
  })
  async channelList(@Query() query: NotificationWebhookChannelListReqDto) {
    const {page, pageSize, accessKeyId} = query;
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.NotificationWebhookChannel,
      pagination: {page, pageSize},
      findManyArgs: {
        where: {
          deletedAt: null,
          accessKeyId,
        },
      },
    });
  }

  @Get('record/list')
  @ApiResponse({
    type: NotificationWebhookRecordListResDto,
  })
  async recordList(@Query() query: NotificationWebhookRecordListReqDto) {
    const {page, pageSize, channelId} = query;
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.NotificationWebhookRecord,
      pagination: {page, pageSize},
      findManyArgs: {
        where: {
          channelId,
        },
        orderBy: {id: 'desc'},
      },
    });
  }

  @NoGuard()
  @Post('feishu/webhook')
  @ApiBody({
    type: NotificationFeishuWebhookReqDto,
  })
  async feishuWebhook(
    @Body()
    body: NotificationFeishuWebhookReqDto
  ) {
    this.logger.log(
      'feishu/webhook:' + JSON.stringify(body),
      this.loggerContext
    );
    return await this.feishuWebhookService.send(body);
  }
}
