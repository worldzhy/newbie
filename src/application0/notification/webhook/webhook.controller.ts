import {Controller, Post, Body, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody, ApiResponse} from '@nestjs/swagger';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma} from '@prisma/client';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {
  FeishuNotificationService,
  FeishuNotificationReqDto,
} from '@microservices/notification/webhook/feishu/feishu-notification.service';
import {NotificationWebhookService} from '@microservices/notification/webhook/webhook.service';
import {
  NotificationAccessKeyCreateReqDto,
  NotificationAccessKeyUpdateReqDto,
  NotificationWebhookChannelCreateReqDto,
  NotificationWebhookChannelUpdateReqDto,
} from '@microservices/notification/webhook/webhook.dto';
import {
  NotificationAccessKeyListReqDto,
  NotificationAccessKeyListResDto,
  NotificationWebhookChannelListReqDto,
  NotificationWebhookChannelListResDto,
  NotificationWebhookRecordListReqDto,
  NotificationWebhookRecordListResDto,
} from './webhook.dto';

@ApiTags('Notification / Webhook')
@ApiBearerAuth()
@Controller('notification/webhook')
export class NotificationWebhookController {
  private loggerContext = 'NotificationWebhook';
  callBackOrigin: string;

  constructor(
    private feishuNotificationService: FeishuNotificationService,
    private notificationWebhookService: NotificationWebhookService,
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService
  ) {}

  @Get('account/list')
  @ApiResponse({
    type: NotificationAccessKeyListResDto,
  })
  async accountList(@Query() query: NotificationAccessKeyListReqDto) {
    const {page, pageSize, id} = query;
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.NotificationAccessKey,
      pagination: {page, pageSize},
      findManyArgs: {
        where: {
          id,
        },
      },
    });
  }

  @Post('account/create')
  @ApiBody({
    type: NotificationAccessKeyCreateReqDto,
  })
  async accountCreate(
    @Body()
    body: NotificationAccessKeyCreateReqDto
  ) {
    return await this.notificationWebhookService.accountCreate(body);
  }

  @Post('account/update')
  @ApiBody({
    type: NotificationAccessKeyUpdateReqDto,
  })
  async accountUpdate(
    @Body()
    body: NotificationAccessKeyUpdateReqDto
  ) {
    return await this.notificationWebhookService.accountUpdate(body);
  }

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

  @Get('channel/list')
  @ApiResponse({
    type: NotificationWebhookChannelListResDto,
  })
  async channelList(@Query() query: NotificationWebhookChannelListReqDto) {
    const {page, pageSize, accountId} = query;
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.NotificationWebhookChannel,
      pagination: {page, pageSize},
      findManyArgs: {
        where: {
          accountId,
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
      },
    });
  }

  @NoGuard()
  @Post('feishu/webhook')
  @ApiBody({
    type: FeishuNotificationReqDto,
  })
  async feishuWebhook(
    @Body()
    body: FeishuNotificationReqDto
  ) {
    this.logger.log(
      'feishu/webhook:' + JSON.stringify(body),
      this.loggerContext
    );
    return await this.feishuNotificationService.send(body);
  }
}
