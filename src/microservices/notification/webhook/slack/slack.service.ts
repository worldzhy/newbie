import {HttpService} from '@nestjs/axios';
import {AxiosResponse, AxiosError} from 'axios';
import {Injectable, BadRequestException} from '@nestjs/common';
import {PrismaService} from '@framework/prisma/prisma.service';
import {
  NotificationSlackWebhookReqDto,
  SlackWebhookPostBodyDto,
  NotificationSlackWebhookResDto,
  SlackWebhookPostResDto,
} from './slack.dto';
import {
  NotificationWebhookPlatform,
  NotificationWebhookRecordStatus,
} from '../constants';
import {
  NotificationWebhookChannelCreateReqDto,
  NotificationWebhookChannelUpdateReqDto,
} from '../webhook.dto';

export * from './slack.dto';

@Injectable()
export class SlackWebhookService {
  constructor(
    private httpService: HttpService,
    private readonly prisma: PrismaService
  ) {}

  async createChannel(
    body: NotificationWebhookChannelCreateReqDto
  ): Promise<{id: number}> {
    const {name} = body;
    const channel = await this.prisma.notificationWebhookChannel.findFirst({
      where: {name, platform: NotificationWebhookPlatform.Slack},
    });
    if (channel) {
      throw new BadRequestException('Channel name already exists');
    }

    return await this.prisma.notificationWebhookChannel.create({
      data: {...body, platform: NotificationWebhookPlatform.Slack},
    });
  }

  async updateChannel(
    body: NotificationWebhookChannelUpdateReqDto
  ): Promise<{id: number}> {
    const {id} = body;
    return await this.prisma.notificationWebhookChannel.update({
      where: {id},
      data: {...body},
    });
  }

  async deleteChannel(
    body: NotificationWebhookChannelUpdateReqDto
  ): Promise<{id: number}> {
    const {id} = body;

    return await this.prisma.notificationWebhookChannel.update({
      where: {id},
      data: {deletedAt: new Date()},
    });
  }

  async send(req: NotificationSlackWebhookReqDto) {
    const {channelName, body} = req;
    const channel =
      await this.prisma.notificationWebhookChannel.findUniqueOrThrow({
        where: {
          name_platform: {
            name: channelName,
            platform: NotificationWebhookPlatform.Slack,
          },
        },
      });

    const newRecord = await this.prisma.notificationWebhookRecord.create({
      data: {
        channelId: channel.id,
        status: NotificationWebhookRecordStatus.Pending,
        request: body as object,
      },
    });

    const result: NotificationSlackWebhookResDto =
      await this.httpService.axiosRef
        .post<SlackWebhookPostBodyDto, AxiosResponse<SlackWebhookPostResDto>>(
          channel.webhook,
          body
        )
        .then(res => {
          return {res: res.data};
        })
        .catch((e: AxiosError) => {
          return {error: {message: e.response?.data}};
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
