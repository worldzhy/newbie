import {Injectable} from '@nestjs/common';
import {PinpointClient, SendMessagesCommand} from '@aws-sdk/client-pinpoint';
import {CommonConfig} from '../../_config/_common.config';

@Injectable()
export class PinpointService {
  private client: PinpointClient;
  private pinpointAppId = CommonConfig.getPinpointAppId();
  private pinpointEmailFromAddress = CommonConfig.getPinpointEmailFromAddress();

  constructor() {
    this.client = new PinpointClient({});
  }

  /**
   * Send Pinpoint messages
   *
   * @param {*} params
   * @returns
   * @memberof PinpointService
   */
  async sendMessages(params) {
    return await this.client.send(new SendMessagesCommand(params));
  }

  // Construct params for client.sendMessages()
  generateEmailMessageParams(data) {
    return {
      ApplicationId: this.pinpointAppId,
      MessageRequest: {
        Addresses: {
          [data.toAddress]: {
            ChannelType: 'EMAIL',
          },
        },
        MessageConfiguration: {
          EmailMessage: {
            FromAddress: this.pinpointEmailFromAddress,
            SimpleEmail: {
              Subject: {
                Charset: 'UTF-8',
                Data: data.subject,
              },
              HtmlPart: {
                Charset: 'UTF-8',
                Data: data.content,
              },
            },
          },
        },
      },
    };
  }

  generateRawEmailMessageParams(data) {
    return {
      ApplicationId: this.pinpointAppId,
      MessageRequest: {
        Addresses: {
          [data.toAddress]: {
            ChannelType: 'EMAIL',
          },
        },
        MessageConfiguration: {
          EmailMessage: {
            FromAddress: this.pinpointEmailFromAddress,
            RawEmail: {
              Data: data.rawData,
            },
          },
        },
      },
    };
  }

  generateSmsMessageParams(data) {
    return {
      ApplicationId: this.pinpointAppId,
      MessageRequest: {
        Addresses: {
          [data.phone]: {
            ChannelType: 'SMS',
          },
        },
        MessageConfiguration: {
          SMSMessage: {
            Body: data.content,
            Keyword: data.keyword,
            MessageType: data.messageType,
            SenderId: data.senderId,
          },
        },
      },
    };
  }

  /**
   * Check the doc below for detailed MessageResponse structure:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Pinpoint.html#sendMessages-property
   *
   * @param {*} response
   * @returns
   * @memberof PinpointService
   */
  parseSendMessageResponse(response) {
    if (
      response &&
      response.MessageResponse &&
      response.MessageResponse.Result
    ) {
      return response.MessageResponse.Result;
    } else {
      return null;
    }
  }
}
