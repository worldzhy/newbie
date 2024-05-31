import {HttpService} from '@nestjs/axios';
import {AxiosResponse, AxiosError} from 'axios';
import {Injectable, BadRequestException} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {FeishuWebhookSendStatus} from './constants';
import {
  NotificationFeishuWebhookReqDto,
  FeishuWebhookPostResDto,
  FeishuWebhookPostBodyDto,
  NotificationFeishuWebhookResDto,
} from './feishu-webhook.dto';
import {NotificationAccessKeyStatus} from '@microservices/notification/constants';
import {NotificationWebhookRecordStatus} from '../constants';
export * from './feishu-webhook.dto';

@Injectable()
export class FeishuWebhookService {
  private loggerContext = 'feishu-Webhook';

  constructor(
    private httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService
  ) {}

  async send(body: NotificationFeishuWebhookReqDto) {
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
    if (channel.accessKey?.status === NotificationAccessKeyStatus.Inactive)
      throw new BadRequestException('AccessKey is inactive.');

    const newRecord = await this.prisma.notificationWebhookRecord.create({
      data: {
        channelId: channel.id,
        status: NotificationWebhookRecordStatus.Pending,
        request: feishuParams as object,
      },
    });

    const result: NotificationFeishuWebhookResDto =
      await this.httpService.axiosRef
        .post<FeishuWebhookPostBodyDto, AxiosResponse<FeishuWebhookPostResDto>>(
          channel.webhook,
          feishuParams
        )
        .then(res => {
          if (res.data.code === FeishuWebhookSendStatus.Succeeded) {
            this.logger.log(
              `FeishuNotification send [${channel.webhook}] success: ` +
                JSON.stringify(res.data),
              this.loggerContext
            );
            return {res: res.data};
          } else {
            const resError = {error: res.data};
            this.logger.error(
              `FeishuNotification send [${channel.webhook}] error: ` +
                JSON.stringify(resError),
              this.loggerContext
            );
            return resError;
          }
        })
        .catch((e: AxiosError) => {
          const resError = {error: {message: e.message, response: e.response}};
          this.logger.error(
            `FeishuNotification send [${channel.webhook}] error: ` +
              JSON.stringify(resError),
            this.loggerContext
          );
          return resError;
        });

    await this.prisma.notificationWebhookRecord.update({
      where: {id: newRecord.id},
      data: {
        response: result as object,
        status: result.error
          ? NotificationWebhookRecordStatus.Failed
          : NotificationWebhookRecordStatus.Succeeded,
      },
    });
    return result;
  }
}
