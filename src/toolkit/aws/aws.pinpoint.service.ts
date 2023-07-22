import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  PinpointClient,
  SendMessagesCommand,
  SendMessagesCommandInput,
  SendMessagesCommandOutput,
} from '@aws-sdk/client-pinpoint';

@Injectable()
export class PinpointService {
  private client: PinpointClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new PinpointClient({
      region: this.configService.get<string>('toolkit.aws.pinpoint.region'),
      credentials: {
        accessKeyId: this.configService.get<string>(
          'toolkit.aws.pinpoint.accessKeyId'
        )!,
        secretAccessKey: this.configService.get<string>(
          'toolkit.aws.pinpoint.secretAccessKey'
        )!,
      },
    });
  }

  async sendEmail(params: {
    email: string;
    subject: string;
    plainText?: string;
    html?: string;
  }) {
    const commandInput = this.buildSendMessagesParams_Email({
      emails: [params.email],
      subject: params.subject,
      plainText: params.plainText,
      html: params.html,
    });
    return await this.client.send(new SendMessagesCommand(commandInput));
  }

  async sendSms(params: {phone: string; text: string}) {
    const commandInput = this.buildSendMessagesParams_Sms({
      phones: [params.phone],
      text: params.text,
    });
    return await this.client.send(new SendMessagesCommand(commandInput));
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
      ApplicationId: this.configService.get<string>(
        'toolkit.aws.pinpoint.applicationId'
      ),
      MessageRequest: {
        Addresses: addresses,
        MessageConfiguration: {
          EmailMessage: {
            FromAddress: this.configService.get<string>(
              'toolkit.aws.pinpoint.fromAddress'
            ),
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

  private buildSendMessagesParams_RawEmail(data: {
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
      ApplicationId: this.configService.get<string>(
        'toolkit.aws.pinpoint.applicationId'
      ),
      MessageRequest: {
        Addresses: addresses,
        MessageConfiguration: {
          EmailMessage: {
            FromAddress: this.configService.get<string>(
              'toolkit.aws.pinpoint.fromAddress'
            ),
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
  private buildSendMessagesParams_Sms(data: {
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
      ApplicationId: this.configService.get<string>(
        'toolkit.aws.pinpoint.applicationId'
      ),
      MessageRequest: {
        Addresses: addresses,
        MessageConfiguration: {
          SMSMessage: {
            Body: data.text,
            Keyword: data.keyword,
            MessageType: data.messageType,
            SenderId: this.configService.get<string>(
              'toolkit.aws.pinpoint.senderId'
            ),
          },
        },
      },
    };
  }
}
