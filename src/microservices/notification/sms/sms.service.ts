import {Injectable} from '@nestjs/common';
import {SendMessagesCommandOutput} from '@aws-sdk/client-pinpoint';
import {SmsNotification, Prisma} from '@prisma/client';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';
import {PinpointService} from '../../../toolkit/aws/aws.pinpoint.service';

@Injectable()
export class SmsNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pinpointService: PinpointService
  ) {}

  async findUnique(
    params: Prisma.SmsNotificationFindUniqueArgs
  ): Promise<SmsNotification | null> {
    return await this.prisma.smsNotification.findUnique(params);
  }

  async findMany(
    params: Prisma.SmsNotificationFindManyArgs
  ): Promise<SmsNotification[]> {
    return await this.prisma.smsNotification.findMany(params);
  }

  async create(
    params: Prisma.SmsNotificationCreateArgs
  ): Promise<SmsNotification> {
    return await this.prisma.smsNotification.create(params);
  }

  async update(
    params: Prisma.SmsNotificationUpdateArgs
  ): Promise<SmsNotification> {
    return await this.prisma.smsNotification.update(params);
  }

  async delete(
    params: Prisma.SmsNotificationDeleteArgs
  ): Promise<SmsNotification> {
    return await this.prisma.smsNotification.delete(params);
  }

  async sendTextMessage(params: {
    phone: string;
    text: string;
  }): Promise<SmsNotification> {
    // [step 1] Send AWS Pinpoint message.
    const output: SendMessagesCommandOutput =
      await this.pinpointService.sendSms(params);

    // [step 2] Save notification record.
    let pinpointRequestId: string | undefined;
    let pinpointMessageId: string | undefined;
    if (output.MessageResponse) {
      pinpointRequestId = output.MessageResponse.RequestId;
      if (output.MessageResponse?.Result) {
        pinpointMessageId =
          output.MessageResponse?.Result[params.phone].MessageId;
      }
    }

    return await this.prisma.smsNotification.create({
      data: {
        payload: params,
        pinpointRequestId: pinpointRequestId,
        pinpointMessageId: pinpointMessageId,
        pinpointResponse: output as object,
      },
    });
  }
}
