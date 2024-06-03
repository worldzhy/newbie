import {HttpService} from '@nestjs/axios';
import {AxiosResponse, AxiosError} from 'axios';
import {Injectable, BadRequestException} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {
  NotificationSlackWebhookReqDto,
  SlackWebhookPostBodyDto,
  NotificationSlackWebhookResDto,
  SlackWebhookPostResDto,
} from './slack-webhook.dto';
import {NotificationAccessKeyStatus} from '@microservices/notification/constants';
import {NotificationWebhookRecordStatus} from '../constants';

export * from './slack-webhook.dto';

@Injectable()
export class SlackWebhookService {
  private loggerContext = 'Slack-Webhook';

  constructor(
    private httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService
  ) {}

  async send(body: NotificationSlackWebhookReqDto) {
    const {channelName, accessKey, slackParams} = body;
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
        request: slackParams as object,
      },
    });

    const result: NotificationSlackWebhookResDto =
      await this.httpService.axiosRef
        .post<SlackWebhookPostBodyDto, AxiosResponse<SlackWebhookPostResDto>>(
          channel.webhook,
          slackParams
        )
        .then(res => {
          this.logger.log(
            `SlackNotification send [${channel.webhook}] success: ` + res,
            this.loggerContext
          );
          return {res: res.data};
        })
        .catch((e: AxiosError) => {
          const resError = {error: {message: e.response?.data}};
          this.logger.error(
            `SlackNotification send [${channel.webhook}] error: ` +
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
