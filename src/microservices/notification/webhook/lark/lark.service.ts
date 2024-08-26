import {HttpService} from '@nestjs/axios';
import {AxiosResponse, AxiosError} from 'axios';
import {Injectable, BadRequestException} from '@nestjs/common';
import {PrismaService} from '@framework/prisma/prisma.service';
import {LarkWebhookSendStatus} from './constants';
import {
  NotificationLarkWebhookReqDto,
  LarkWebhookPostResDto,
  LarkWebhookPostBodyDto,
  NotificationLarkWebhookResDto,
} from './lark.dto';
import {
  NotificationWebhookPlatform,
  NotificationWebhookRecordStatus,
} from '../constants';
import {
  NotificationWebhookChannelCreateReqDto,
  NotificationWebhookChannelUpdateReqDto,
} from '../webhook.dto';
export * from './lark.dto';

@Injectable()
export class LarkWebhookService {
  constructor(
    private httpService: HttpService,
    private readonly prisma: PrismaService
  ) {}

  async createChannel(
    body: NotificationWebhookChannelCreateReqDto
  ): Promise<{id: number}> {
    const {name} = body;
    const channel = await this.prisma.notificationWebhookChannel.findFirst({
      where: {name, platform: NotificationWebhookPlatform.Lark},
    });
    if (channel) {
      throw new BadRequestException('Channel name already exists');
    }

    return await this.prisma.notificationWebhookChannel.create({
      data: {...body, platform: NotificationWebhookPlatform.Lark},
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

  async sendText(params: {channelName: string; text: string}) {
    return await this.send({
      channelName: params.channelName,
      body: {msg_type: 'text', content: {text: params.text}},
    });
  }

  private async send(req: NotificationLarkWebhookReqDto) {
    const {channelName, body} = req;
    const channel =
      await this.prisma.notificationWebhookChannel.findUniqueOrThrow({
        where: {
          name_platform: {
            name: channelName,
            platform: NotificationWebhookPlatform.Lark,
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

    const result: NotificationLarkWebhookResDto =
      await this.httpService.axiosRef
        .post<LarkWebhookPostBodyDto, AxiosResponse<LarkWebhookPostResDto>>(
          channel.webhook,
          body
        )
        .then(res => {
          if (res.data.code === LarkWebhookSendStatus.Succeeded) {
            return {res: res.data};
          } else {
            return {error: res.data};
          }
        })
        .catch((e: AxiosError) => {
          return {error: {message: e.message, response: e.response}};
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
