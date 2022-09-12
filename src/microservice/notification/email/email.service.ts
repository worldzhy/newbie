import {Inject, Injectable} from '@nestjs/common';
import {NotificationConfiguration} from '@prisma/client';
import {PinpointService} from '../../../_aws/_pinpoint.service';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class EmailService {
  private prisma = new PrismaService();
  private pinpointService: PinpointService;
  private config: NotificationConfiguration;

  constructor(
    @Inject('NotificationConfiguration') config: NotificationConfiguration
  ) {
    this.config = config;

    if (config.pinpointFromAddress) {
      this.pinpointService = new PinpointService({
        pinpointApplicationId: config.pinpointApplicationId,
        pinpointFromAddress: config.pinpointFromAddress,
      });
    } else {
      this.pinpointService = new PinpointService({
        pinpointApplicationId: config.pinpointApplicationId,
      });
    }
  }

  /**
   * Send one email.
   * @param payload
   * @returns
   */
  async sendOne(payload: {
    email: string;
    subject: string;
    plainText?: string;
    html?: string;
  }) {
    // [step 1] Send AWS Pinpoint message.
    const emailParams = this.pinpointService.buildSendMessagesParams_Email({
      emails: [payload.email],
      subject: payload.subject,
      plainText: payload.plainText,
      html: payload.html,
    });
    const output = await this.pinpointService.sendMessages(emailParams);

    // [step 2] Save notification record.
    let pinpointRequestId: string | undefined;
    let pinpointMessageId: string | undefined;
    if (output.MessageResponse) {
      pinpointRequestId = output.MessageResponse.RequestId;
      if (output.MessageResponse?.Result) {
        pinpointMessageId =
          output.MessageResponse?.Result[payload.email].MessageId;
      }
    }

    return await this.prisma.smsNotification.create({
      data: {
        payload: payload,
        pinpointRequestId: pinpointRequestId,
        pinpointMessageId: pinpointMessageId,
        pinpointResponse: output as object,
        configurationId: this.config.id,
      },
    });
  }

  /**
   * Send many emails.
   * @param payload
   * @returns
   */
  async sendMany(payload: {
    emails: string[];
    subject: string;
    plainText?: string;
    html?: string;
  }) {
    const emailParams =
      this.pinpointService.buildSendMessagesParams_Email(payload);

    return await this.pinpointService.sendMessages(emailParams);
  }
}
