import {Injectable, BadRequestException} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {generateRandomCode} from '@toolkit/utilities/common.util';
import {ThirdNotificationAccountStatus} from './constants';
import {
  ThirdNotificationAccountAddReqDto,
  ThirdNotificationChannelAddReqDto,
  ThirdNotificationChannelUpdateReqDto,
} from './third-notification.dto';
export * from './constants';

@Injectable()
export class ThirdNotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async accountAdd(
    body: ThirdNotificationAccountAddReqDto
  ): Promise<{accessKey: string}> {
    const accessKey = generateRandomCode(10);
    const account = await this.prisma.thirdNotificationAccount.findFirst({
      where: {
        accessKey,
      },
    });
    if (account) {
      return await this.accountAdd(body);
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

  async accountList() {
    return await this.prisma.thirdNotificationAccount.findMany();
  }

  async channelAdd(
    body: ThirdNotificationChannelAddReqDto
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
