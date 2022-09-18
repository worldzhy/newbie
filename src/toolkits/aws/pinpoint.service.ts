import {Injectable} from '@nestjs/common';
import {
  PinpointClient,
  SendMessagesCommand,
  SendMessagesCommandInput,
  SendMessagesCommandOutput,
} from '@aws-sdk/client-pinpoint';

@Injectable()
export class PinpointService {
  private client: PinpointClient;

  constructor() {
    this.client = new PinpointClient({});
  }

  async sendMessages(params: SendMessagesCommandInput) {
    return await this.client.send(new SendMessagesCommand(params));
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
