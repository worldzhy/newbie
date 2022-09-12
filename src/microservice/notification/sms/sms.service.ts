import {Inject, Injectable} from '@nestjs/common';
import {NotificationConfiguration} from '@prisma/client';
import {PinpointService} from '../../../_aws/_pinpoint.service';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class SmsService {
  private prisma = new PrismaService();
  private pinpointService: PinpointService;
  private config: NotificationConfiguration;

  constructor(
    @Inject('NotificationConfiguration') config: NotificationConfiguration
  ) {
    this.config = config;

    if (config.pinpointSenderId) {
      this.pinpointService = new PinpointService({
        pinpointApplicationId: config.pinpointApplicationId,
        pinpointSenderId: config.pinpointSenderId,
      });
    } else {
      this.pinpointService = new PinpointService({
        pinpointApplicationId: config.pinpointApplicationId,
      });
    }
  }

  /**
   * Send one text message
   * @param payload
   * @returns
   */
  async sendOne(payload: {phone: string; text: string}) {
    // [step 1] Send AWS Pinpoint message.
    const smsParams = this.pinpointService.buildSendMessagesParams_Sms({
      phones: [payload.phone],
      text: payload.text,
    });
    const output = await this.pinpointService.sendMessages(smsParams);

    // [step 2] Save notification record.
    let pinpointRequestId: string | undefined;
    let pinpointMessageId: string | undefined;
    if (output.MessageResponse) {
      pinpointRequestId = output.MessageResponse.RequestId;
      if (output.MessageResponse?.Result) {
        pinpointMessageId =
          output.MessageResponse?.Result[payload.phone].MessageId;
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
   * Send many text messages
   * @param payload
   * @returns
   */
  async sendMany(payload: {phones: string[]; text: string}) {
    const smsParams = this.pinpointService.buildSendMessagesParams_Sms(payload);
    const output = await this.pinpointService.sendMessages(smsParams);
    const result = this.pinpointService.parseSendMessagesOutput(output);
  }
}
