import {Injectable} from '@nestjs/common';
import {SendMessagesCommandOutput} from '@aws-sdk/client-pinpoint';
import {EmailNotification, Prisma} from '@prisma/client';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';
import {PinpointService} from '../../../toolkit/aws/aws.pinpoint.service';

@Injectable()
export class EmailNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pinpointService: PinpointService
  ) {}

  async findUnique(
    params: Prisma.EmailNotificationFindUniqueArgs
  ): Promise<EmailNotification | null> {
    return await this.prisma.emailNotification.findUnique(params);
  }

  async findMany(
    params: Prisma.EmailNotificationFindManyArgs
  ): Promise<EmailNotification[]> {
    return await this.prisma.emailNotification.findMany(params);
  }

  async create(
    params: Prisma.EmailNotificationCreateArgs
  ): Promise<EmailNotification> {
    return await this.prisma.emailNotification.create(params);
  }

  async update(
    params: Prisma.EmailNotificationUpdateArgs
  ): Promise<EmailNotification> {
    return await this.prisma.emailNotification.update(params);
  }

  async delete(
    params: Prisma.EmailNotificationDeleteArgs
  ): Promise<EmailNotification> {
    return await this.prisma.emailNotification.delete(params);
  }

  async sendEmail(params: {
    email: string;
    subject: string;
    plainText?: string;
    html?: string;
  }): Promise<EmailNotification> {
    // [step 1] Send AWS Pinpoint message.
    const output: SendMessagesCommandOutput =
      await this.pinpointService.sendEmail(params);

    // [step 2] Save notification record.
    let pinpointRequestId: string | undefined;
    let pinpointMessageId: string | undefined;
    if (output.MessageResponse) {
      pinpointRequestId = output.MessageResponse.RequestId;
      if (output.MessageResponse?.Result) {
        pinpointMessageId =
          output.MessageResponse?.Result[params.email].MessageId;
      }
    }

    return await this.prisma.emailNotification.create({
      data: {
        payload: params,
        pinpointRequestId: pinpointRequestId,
        pinpointMessageId: pinpointMessageId,
        pinpointResponse: output as object,
      },
    });
  }
}
