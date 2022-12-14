import {Injectable} from '@nestjs/common';
import {
  PinpointClient,
  SendMessagesCommand,
  SendMessagesCommandInput,
  SendMessagesCommandOutput,
} from '@aws-sdk/client-pinpoint';
import {SmsNotification, Prisma} from '@prisma/client';
import {PrismaService} from '../../../toolkits/prisma/prisma.service';
import {getAwsPinpointConfig} from '../../../toolkits/aws/pinpoint.config';

@Injectable()
export class SmsNotificationService {
  private prisma = new PrismaService();
  private client: PinpointClient;
  private pinpointAppId: string;
  private pinpointSenderId: string;

  constructor() {
    this.client = new PinpointClient({});
    this.pinpointAppId = getAwsPinpointConfig().pinpointApplicationId;
    this.pinpointSenderId = getAwsPinpointConfig().pinpointSenderId;
  }

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
    const commandInput = this.buildSendMessagesParams_Sms({
      phones: [params.phone],
      text: params.text,
    });
    const output: SendMessagesCommandOutput = await this.client.send(
      new SendMessagesCommand(commandInput)
    );

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

  /**
   * Construct params for sending text messages.
   * @param data
   * @returns
   */
  private buildSendMessagesParams_Sms(data: {
    phones: string[];
    text: string;
    keyword?: string;
    messageType?: string; // 'TRANSACTIONAL' or 'PROMOTIONAL'
  }): SendMessagesCommandInput {
    const addresses: {[phone: string]: {ChannelType: string}} = {};
    data.phones.map((phone) => {
      addresses[phone] = {
        ChannelType: 'SMS',
      };
    });

    return {
      ApplicationId: this.pinpointAppId,
      MessageRequest: {
        Addresses: addresses,
        MessageConfiguration: {
          SMSMessage: {
            Body: data.text,
            Keyword: data.keyword,
            MessageType: data.messageType,
            SenderId: this.pinpointSenderId,
          },
        },
      },
    };
  }
}
