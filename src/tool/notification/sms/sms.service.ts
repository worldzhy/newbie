import {Injectable} from '@nestjs/common';
import {PinpointService} from 'src/_aws/_pinpoint.service';

@Injectable()
export class SmsService {
  private pinpointService = new PinpointService();

  /**
   * Send one text message
   * @param data
   * @returns
   */
  async sendOne(data: {phone: string; text: string}) {
    const smsParams = this.pinpointService.buildSendMessagesParams_Sms({
      phones: [data.phone],
      text: data.text,
    });
    const output = await this.pinpointService.sendMessages(smsParams);
    const result = this.pinpointService.parseSendMessagesOutput(output);
    return {};
  }

  /**
   * Send many text messages
   * @param data
   * @returns
   */
  async sendMany(data: {phones: string[]; text: string}) {
    const smsParams = this.pinpointService.buildSendMessagesParams_Sms(data);
    const output = await this.pinpointService.sendMessages(smsParams);
    const result = this.pinpointService.parseSendMessagesOutput(output);
  }
}
