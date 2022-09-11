import {Injectable} from '@nestjs/common';
import {PinpointService} from 'src/_aws/_pinpoint.service';
import {AwsConfig} from '../../../_config/_aws.config';

@Injectable()
export class EmailService {
  private pinpointService = new PinpointService();

  /**
   * Send one email.
   * @param data
   * @returns
   */
  async sendOne(data: {
    email: string;
    subject: string;
    plainText?: string;
    html?: string;
  }) {
    const emailParams = this.pinpointService.buildSendMessagesParams_Email({
      emails: [data.email],
      subject: data.subject,
      plainText: data.plainText,
      html: data.html,
    });

    return await this.pinpointService.sendMessages(emailParams);
  }

  /**
   * Send many emails.
   * @param data
   * @returns
   */
  async sendMany(data: {
    emails: string[];
    subject: string;
    plainText?: string;
    html?: string;
  }) {
    const emailParams =
      this.pinpointService.buildSendMessagesParams_Email(data);

    return await this.pinpointService.sendMessages(emailParams);
  }
}
