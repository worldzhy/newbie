import {Injectable, BadRequestException} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {generateRandomCode} from '@toolkit/utilities/common.util';
import {NotificationAccessStatus} from './constants';
import {
  NotificationAccessKeyCreateReqDto,
  NotificationWebhookAccountUpdateReqDto,
  NotificationWebhookChannelCreateReqDto,
  NotificationWebhookChannelUpdateReqDto,
} from './webhook.dto';
export * from './constants';

@Injectable()
export class NotificationWebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async accountCreate(
    body: NotificationAccessKeyCreateReqDto
  ): Promise<{accessKey: string}> {
    const accessKey = generateRandomCode(10);
    const account = await this.prisma.notificationAccessKey.findFirst({
      where: {
        key: accessKey,
      },
    });
    if (account) {
      return await this.accountCreate(body);
    }

    await this.prisma.notificationAccessKey.create({
      data: {
        status: NotificationAccessStatus.active,
        key: accessKey,
        ...body,
      },
    });
    return {accessKey};
  }

  async accountUpdate(
    body: NotificationWebhookAccountUpdateReqDto
  ): Promise<{id: number}> {
    const {id, ...data} = body;
    await this.prisma.notificationAccessKey.update({
      where: {id},
      data,
    });
    return {id};
  }

  async accountList() {
    return await this.prisma.notificationAccessKey.findMany();
  }

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
    const newChannel = await this.prisma.notificationWebhookChannel.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });
    return {id: newChannel.id};
  }
}
