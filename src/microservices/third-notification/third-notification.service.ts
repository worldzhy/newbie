import {Injectable, BadRequestException} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {generateRandomCode} from '@toolkit/utilities/common.util';
import {ThirdNotificationAccountStatus} from './constants';
import {
  ThirdNotificationAccountCreateReqDto,
  ThirdNotificationAccountUpdateReqDto,
  ThirdNotificationChannelCreateReqDto,
  ThirdNotificationChannelUpdateReqDto,
} from './third-notification.dto';
export * from './constants';

@Injectable()
export class ThirdNotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async accountCreate(
    body: ThirdNotificationAccountCreateReqDto
  ): Promise<{accessKey: string}> {
    const accessKey = generateRandomCode(10);
    const account = await this.prisma.thirdNotificationAccount.findFirst({
      where: {
        accessKey,
      },
    });
    if (account) {
      return await this.accountCreate(body);
    }

    await this.prisma.thirdNotificationAccount.create({
      data: {
        status: ThirdNotificationAccountStatus.normal,
        accessKey,
        ...body,
      },
    });
    return {accessKey};
  }

  async accountUpdate(
    body: ThirdNotificationAccountUpdateReqDto
  ): Promise<{id: number}> {
    const {id, ...data} = body;
    await this.prisma.thirdNotificationAccount.update({
      where: {id},
      data,
    });
    return {id};
  }

  async accountList() {
    return await this.prisma.thirdNotificationAccount.findMany();
  }

  async channelCreate(
    body: ThirdNotificationChannelCreateReqDto
  ): Promise<{id: number}> {
    const {name} = body;
    const channel = await this.prisma.thirdNotificationChannel.findFirst({
      where: {
        name,
      },
    });
    if (channel) {
      throw new BadRequestException('Channel name already exists');
    }

    const newChannel = await this.prisma.thirdNotificationChannel.create({
      data: {
        status: ThirdNotificationAccountStatus.normal,
        ...body,
      },
    });
    return {id: newChannel.id};
  }

  async channelUpdate(
    body: ThirdNotificationChannelUpdateReqDto
  ): Promise<{id: number}> {
    const {id} = body;
    const newChannel = await this.prisma.thirdNotificationChannel.update({
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
