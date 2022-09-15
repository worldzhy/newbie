import {Injectable} from '@nestjs/common';
import {PinpointService} from '../../../tools/aws/pinpoint.service';
import {PrismaService} from '../../../tools/prisma/prisma.service';

@Injectable()
export class EmailService {
  private prisma = new PrismaService();
  private pinpointService = new PinpointService();

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

    return await this.prisma.emailNotification.create({
      data: {
        payload: payload,
        pinpointRequestId: pinpointRequestId,
        pinpointMessageId: pinpointMessageId,
        pinpointResponse: output as object,
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
