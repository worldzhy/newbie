import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody, ApiResponse} from '@nestjs/swagger';
import {ConfigService} from '@nestjs/config';
// import {PrismaService} from '@toolkit/prisma/prisma.service';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {
  FeishuNotificationService,
  FeishuNotificationReqDto,
} from '@microservices/third-notification/feishu/feishu-notification.service';
import {ThirdNotificationService} from '@microservices/third-notification/third-notification.service';
import {
  ThirdNotificationAccountAddReqDto,
  ThirdNotificationChannelAddReqDto,
  ThirdNotificationChannelUpdateReqDto,
} from '@microservices/third-notification//third-notification.dto';

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
    private readonly logger: CustomLoggerService
  ) {
    // this.callBackOrigin = this.configService.getOrThrow<string>(
    //   'microservice.peopleFinder.voilanorbert.callbackOrigin'
    // );
  }

  @Post('account/add')
  @ApiBody({
    type: ThirdNotificationAccountAddReqDto,
  })
  async accountAdd(
    @Body()
    body: ThirdNotificationAccountAddReqDto
  ) {
    return await this.thirdNotificationService.accountAdd(body);
  }

  @Post('channel/add')
  @ApiBody({
    type: ThirdNotificationChannelAddReqDto,
  })
  async channelAdd(
    @Body()
    body: ThirdNotificationChannelAddReqDto
  ) {
    return await this.thirdNotificationService.channelAdd(body);
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
