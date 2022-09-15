import {Injectable} from '@nestjs/common';
import {
  PinpointClient,
  SendMessagesCommand,
  SendMessagesCommandInput,
  SendMessagesCommandOutput,
} from '@aws-sdk/client-pinpoint';
import {getAwsConfig} from '../_config/_aws.config';

@Injectable()
export class PinpointService {
  private client: PinpointClient;

  private pinpointAppId: string;
  private pinpointFromAddress?: string; // For email message
  private pinpointSenderId?: string; // For text message

  constructor() {
    this.client = new PinpointClient({});
    this.pinpointAppId = getAwsConfig().pinpointApplicationId!;
    this.pinpointFromAddress = getAwsConfig().pinpointFromAddress;
    this.pinpointSenderId = getAwsConfig().pinpointSenderId;
  }

  /**
   * Send Pinpoint messages
   *
   * @param {*} params
   * @returns
   * @memberof PinpointService
   */
  async sendMessages(params: SendMessagesCommandInput) {
    return await this.client.send(new SendMessagesCommand(params));
  }

  /**
   * Construct params for sending emails.
   * * We recommend using plain text format for email clients that don't render HTML content
   * * and clients that are connected to high-latency networks, such as mobile devices.
   *
   * @param data
   * @returns
   */
  buildSendMessagesParams_Email(data: {
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
    rawData: any;
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

  /**
   * Construct params for sending text messages.
   * @param data
   * @returns
   */
  buildSendMessagesParams_Sms(data: {
    phones: string[];
    text: string;
    keyword?: string;
    messageType?: string; // 'TRANSACTIONAL' or 'PROMOTIONAL'
  }): SendMessagesCommandInput {
    const addresses: {[phone: string]: {ChannelType: string}} = {};
    data.phones.map(phone => {
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

  /**
   * Check the doc below for detailed MessageResponse structure:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Pinpoint.html#sendMessages-property
   * @param {SendMessagesCommandOutput} output
   * @returns
   * @memberof PinpointService
   */
  parseSendMessagesOutput(output: SendMessagesCommandOutput) {
    if (output && output.MessageResponse && output.MessageResponse.Result) {
      return output.MessageResponse.Result;
    } else {
      return output;
    }
  }
}
