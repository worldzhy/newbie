import {Injectable} from '@nestjs/common';
import {
  PinpointClient,
  SendMessagesCommand,
  SendMessagesCommandInput,
  SendMessagesCommandOutput,
} from '@aws-sdk/client-pinpoint';
import {EmailNotification, Prisma} from '@prisma/client';
import {PrismaService} from '../../../toolkits/prisma/prisma.service';
import {getAwsConfig} from '../../../_config/_aws.config';

@Injectable()
export class EmailNotificationService {
  private prisma = new PrismaService();
  private client: PinpointClient;
  private pinpointAppId: string;
  private pinpointFromAddress?: string;

  constructor() {
    this.client = new PinpointClient({});
    this.pinpointAppId = getAwsConfig().pinpointApplicationId!;
    this.pinpointFromAddress = getAwsConfig().pinpointFromAddress;
  }

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
    const commandInput = this.buildSendMessagesParams_Email({
      emails: [params.email],
      subject: params.subject,
      plainText: params.plainText,
      html: params.html,
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

  /**
   * Construct params for sending emails.
   * * We recommend using plain text format for email clients that don't render HTML content
   * * and clients that are connected to high-latency networks, such as mobile devices.
   *
   * @param data
   * @returns
   */
  private buildSendMessagesParams_Email(data: {
    emails: string[];
    subject: string;
    plainText?: string;
    html?: string;
  }): SendMessagesCommandInput {
    const addresses: {[email: string]: {ChannelType: string}} = {};
    data.emails.map(email => {
      addresses[email] = {
        ChannelType: 'EMAIL',
      };
    });

    return {
      ApplicationId: this.pinpointAppId,
      MessageRequest: {
        Addresses: addresses,
        MessageConfiguration: {
          EmailMessage: {
            FromAddress: this.pinpointFromAddress,
            SimpleEmail: {
              Subject: {
                Charset: 'UTF-8',
                Data: data.subject,
              },
              HtmlPart: {
                Charset: 'UTF-8',
                Data: data.html,
              },
              TextPart: {
                Charset: 'UTF-8',
                Data: data.plainText,
              },
            },
          },
        },
      },
    };
  }

  buildSendMessagesParams_RawEmail(data: {
    emails: string[];
    rawData: Uint8Array;
  }): SendMessagesCommandInput {
    const addresses: {[email: string]: {ChannelType: string}} = {};
    data.emails.map(email => {
      addresses[email] = {
        ChannelType: 'EMAIL',
      };
    });

    return {
      ApplicationId: this.pinpointAppId,
      MessageRequest: {
        Addresses: addresses,
        MessageConfiguration: {
          EmailMessage: {
            FromAddress: this.pinpointFromAddress,
            RawEmail: {
              Data: data.rawData,
            },
          },
        },
      },
    };
  }
}
