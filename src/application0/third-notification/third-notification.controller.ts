import {Controller, Post, Body, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody, ApiResponse} from '@nestjs/swagger';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma} from '@prisma/client';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {
  FeishuNotificationService,
  FeishuNotificationReqDto,
} from '@microservices/third-notification/feishu/feishu-notification.service';
import {ThirdNotificationService} from '@microservices/third-notification/third-notification.service';
import {
  ThirdNotificationAccountCreateReqDto,
  ThirdNotificationAccountUpdateReqDto,
  ThirdNotificationChannelCreateReqDto,
  ThirdNotificationChannelUpdateReqDto,
} from '@microservices/third-notification/third-notification.dto';
import {
  // ThirdNotificationAccountDetailResDto,
  ThirdNotificationAccountListReqDto,
  ThirdNotificationAccountListResDto,
  ThirdNotificationChannelListReqDto,
  ThirdNotificationChannelListResDto,
} from './third-notification.dto';

@ApiTags('Third-notification')
@ApiBearerAuth()
@Controller('third-notification')
export class ThirdNotificationController {
  private loggerContext = 'ThirdNotification';
  callBackOrigin: string;

  constructor(
    private readonly configService: ConfigService,
    private feishuNotificationService: FeishuNotificationService,
    private thirdNotificationService: ThirdNotificationService,
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService
  ) {
    // this.callBackOrigin = this.configService.getOrThrow<string>(
    //   'microservice.peopleFinder.voilanorbert.callbackOrigin'
    // );
  }

  @Get('account/list')
  @ApiResponse({
    type: ThirdNotificationAccountListResDto,
  })
  async accountList(@Query() query: ThirdNotificationAccountListReqDto) {
    const {page, pageSize, id} = query;
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.ThirdNotificationAccount,
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
    type: ThirdNotificationAccountCreateReqDto,
  })
  async accountCreate(
    @Body()
    body: ThirdNotificationAccountCreateReqDto
  ) {
    return await this.thirdNotificationService.accountCreate(body);
  }

  @Post('account/update')
  @ApiBody({
    type: ThirdNotificationAccountUpdateReqDto,
  })
  async accountUpdate(
    @Body()
    body: ThirdNotificationAccountUpdateReqDto
  ) {
    return await this.thirdNotificationService.accountUpdate(body);
  }

  @Post('channel/create')
  @ApiBody({
    type: ThirdNotificationChannelCreateReqDto,
  })
  async channelCreate(
    @Body()
    body: ThirdNotificationChannelCreateReqDto
  ) {
    return await this.thirdNotificationService.channelCreate(body);
  }

  @Post('channel/update')
  @ApiBody({
    type: ThirdNotificationChannelUpdateReqDto,
  })
  async channelUpdate(
    @Body()
    body: ThirdNotificationChannelUpdateReqDto
  ) {
    return await this.thirdNotificationService.channelUpdate(body);
  }

  @Get('channel/list')
  @ApiResponse({
    type: ThirdNotificationChannelListResDto,
  })
  async channelList(@Query() query: ThirdNotificationChannelListReqDto) {
    const {page, pageSize, accountId} = query;
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.ThirdNotificationChannel,
      pagination: {page, pageSize},
      findManyArgs: {
        where: {
          accountId,
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
