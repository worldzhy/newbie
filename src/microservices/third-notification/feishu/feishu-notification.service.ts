import {HttpService} from '@nestjs/axios';
import {AxiosResponse, AxiosError} from 'axios';
import {Injectable, BadRequestException} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {FeishuNotificationStatus} from './constants';
import {
  ThirdNotificationAccountStatus,
  ThirdNotificationChannelStatus,
  ThirdNotificationRecordStatus,
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
    const {channelName, ...feishuParams} = body;
    if (!channelName) return;
    const channel = await this.prisma.thirdNotificationChannel.findFirst({
      where: {
        name: channelName,
        status: ThirdNotificationChannelStatus.normal,
      },
      include: {
        thirdNotificationAccount: true,
      },
    });

    if (!channel) throw new BadRequestException('No channel found.');
    if (
      channel.thirdNotificationAccount?.status ===
      ThirdNotificationAccountStatus.disabled
    )
      throw new BadRequestException('Account disabled.');

    const newRecord = await this.prisma.thirdNotificationRecord.create({
      data: {
        channelId: channel.id,
        status: ThirdNotificationRecordStatus.pending,
        reqContext: JSON.stringify(feishuParams),
      },
    });

    const result: {res?: FeishuPostResDto; error?: any} =
      await this.httpService.axiosRef
        .post<FeishuPostBodyDto, AxiosResponse<FeishuPostResDto>>(
          channel.url,
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

    await this.prisma.thirdNotificationRecord.update({
      where: {id: newRecord.id},
      data: {
        resContext: JSON.stringify(result),
        status: result.error
          ? ThirdNotificationRecordStatus.error
          : ThirdNotificationRecordStatus.success,
      },
    });
    return result;
  }
}
