import {HttpService} from '@nestjs/axios';
import {AxiosResponse, AxiosError} from 'axios';
import {Injectable, BadRequestException} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {FeishuNotificationStatus} from './constants';
import {
  NotificationAccessStatus,
  NotificationWebhookRecordStatus,
} from '../constants';
import {
  FeishuNotificationReqDto,
  FeishuPostResDto,
  FeishuPostBodyDto,
} from './feishu-notification.dto';
export * from './feishu-notification.dto';

@Injectable()
export class FeishuNotificationService {
  private loggerContext = 'feishu-notification';

  constructor(
    private httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService
  ) {}

  async send(body: FeishuNotificationReqDto) {
    const {channelName, accessKey, feishuParams} = body;
    const channel = await this.prisma.notificationWebhookChannel.findFirst({
      where: {
        name: channelName,
      },
      include: {
        accessKey: true,
      },
    });

    if (!channel) throw new BadRequestException('No channel found.');
    if (channel.accessKey?.key !== accessKey)
      throw new BadRequestException('AccessKey Error.');
    if (channel.accessKey?.status === NotificationAccessStatus.inactive)
      throw new BadRequestException('Account is inactive.');

    const newRecord = await this.prisma.notificationWebhookRecord.create({
      data: {
        channelId: channel.id,
        status: NotificationWebhookRecordStatus.pending,
        reqContext: JSON.stringify(feishuParams),
      },
    });

    const result: {res?: FeishuPostResDto; error?: any} =
      await this.httpService.axiosRef
        .post<FeishuPostBodyDto, AxiosResponse<FeishuPostResDto>>(
          channel.webhook,
          feishuParams
        )
        .then(res => {
          if (res.data.code === FeishuNotificationStatus.SUCCESS) {
            this.logger.log(
              `FeishuNotification send [${channel.url}] success: ` +
                JSON.stringify(res.data),
              this.loggerContext
            );
            return {res: res.data};
          } else {
            const resError = {error: res.data};
            this.logger.error(
              `FeishuNotification send [${channel.url}] error: ` +
                JSON.stringify(resError),
              this.loggerContext
            );
            return resError;
          }
        })
        .catch((e: AxiosError) => {
          const resError = {error: {message: e.message, response: e.response}};
          this.logger.error(
            `FeishuNotification send [${channel.url}] error: ` +
              JSON.stringify(resError),
            this.loggerContext
          );
          return resError;
        });

    await this.prisma.notificationWebhookRecord.update({
      where: {id: newRecord.id},
      data: {
        resContext: JSON.stringify(result),
        status: result.error
          ? NotificationWebhookRecordStatus.error
          : NotificationWebhookRecordStatus.success,
      },
    });
    return result;
  }
}
