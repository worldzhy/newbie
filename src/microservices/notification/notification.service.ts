import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {generateRandomCode} from '@toolkit/utilities/common.util';
import {NotificationAccessKeyStatus} from './constants';
import {
  NotificationAccessKeyCreateReqDto,
  NotificationAccessKeyUpdateReqDto,
} from './notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async accessKeyCreate(
    body: NotificationAccessKeyCreateReqDto
  ): Promise<{accessKey: string}> {
    const key = generateRandomCode(10);
    const accessKey = await this.prisma.notificationAccessKey.findFirst({
      where: {
        key: key,
      },
    });
    if (accessKey) {
      return await this.accessKeyCreate(body);
    }

    await this.prisma.notificationAccessKey.create({
      data: {
        status: NotificationAccessKeyStatus.Active,
        key,
        ...body,
      },
    });
    return {accessKey: key};
  }

  async accessKeyUpdate(
    body: NotificationAccessKeyUpdateReqDto
  ): Promise<{id: number}> {
    const {id, ...data} = body;
    await this.prisma.notificationAccessKey.update({
      where: {id},
      data,
    });
    return {id};
  }

  async accessKeyDelete(
    body: NotificationAccessKeyUpdateReqDto
  ): Promise<{id: number}> {
    const {id} = body;
    await this.prisma.notificationAccessKey.update({
      where: {id},
      data: {
        deletedAt: new Date(),
      },
    });
    return {id};
  }
}
