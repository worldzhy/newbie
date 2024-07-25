import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  AddressConfiguration,
  PinpointClient,
  SendMessagesCommand,
  SendMessagesCommandInput,
  SendMessagesCommandOutput,
} from '@aws-sdk/client-pinpoint';

@Injectable()
export class AwsPinpointService {
  private client: PinpointClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new PinpointClient({
      region: this.configService.getOrThrow<string>(
        'microservices.notification.aws.region'
      ),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>(
          'microservices.notification.aws.accessKeyId'
        )!,
        secretAccessKey: this.configService.getOrThrow<string>(
          'microservices.notification.aws.secretAccessKey'
        )!,
      },
    });
  }

  async sendEmail(params: {
    applicationId: string;
    fromAddress: string;
    body: {
      email: string;
      subject: string;
      plainText?: string;
      html?: string;
    };
  }) {
    const emails = [params.body.email];
    const subject = params.body.subject;
    const plainText = params.body.plainText;
    const html = params.body.html;
    const addresses: Record<string, AddressConfiguration> = {};
    emails.map(email => {
      addresses[email] = {
        ChannelType: 'EMAIL',
      };
    });

    const commandInput: SendMessagesCommandInput = {
      ApplicationId: params.applicationId,
      MessageRequest: {
        Addresses: addresses,
        MessageConfiguration: {
          EmailMessage: {
            FromAddress: params.fromAddress,
            SimpleEmail: {
              Subject: {
                Charset: 'UTF-8',
                Data: subject,
              },
              HtmlPart: {
                Charset: 'UTF-8',
                Data: html,
              },
              TextPart: {
                Charset: 'UTF-8',
                Data: plainText,
              },
            },
          },
        },
      },
    };

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
}
