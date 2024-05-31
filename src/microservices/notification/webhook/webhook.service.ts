import {Injectable, BadRequestException} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  NotificationWebhookChannelCreateReqDto,
  NotificationWebhookChannelUpdateReqDto,
} from './webhook.dto';
export * from './constants';

@Injectable()
export class NotificationWebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async channelCreate(
    body: NotificationWebhookChannelCreateReqDto
  ): Promise<{id: number}> {
    const {name} = body;
    const channel = await this.prisma.notificationWebhookChannel.findFirst({
      where: {
        name,
      },
    });
    if (channel) {
      throw new BadRequestException('Channel name already exists');
    }

    const newChannel = await this.prisma.notificationWebhookChannel.create({
      data: {
        ...body,
      },
    });
    return {id: newChannel.id};
  }

  async channelUpdate(
    body: NotificationWebhookChannelUpdateReqDto
  ): Promise<{id: number}> {
    const {id} = body;
    await this.prisma.notificationWebhookChannel.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });
    return {id};
  }

  async channelDelete(
    body: NotificationWebhookChannelUpdateReqDto
  ): Promise<{id: number}> {
    const {id} = body;
    await this.prisma.notificationWebhookChannel.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return {id};
  }
}
