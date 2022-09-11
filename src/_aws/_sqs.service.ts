import {Injectable} from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  GetQueueAttributesCommand,
  QueueAttributeName,
} from '@aws-sdk/client-sqs';
import {AwsConfig} from '../_config/_aws.config';

@Injectable()
export class SqsService {
  private client: SQSClient;

  constructor() {
    this.client = new SQSClient({
      region: AwsConfig.getRegion(), // region is required for SQS service.
    });
  }

  /**
   * See the API doc for more details:
   * https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html
   *
   * @param {string} queueUrl
   * @param {object} messageBody
   * @returns {(Promise<{data: SQS.SendMessageResult | void; err: AWSError | void}>)}
   * @memberof SqsService
   */
  async sendMessage(
    queueUrl: string,
    messageBody: object
  ): Promise<{data: any | null; err: any | null}> {
    const sendMessageRequest = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(messageBody),
    };

    const result = await this.client.send(
      new SendMessageCommand(sendMessageRequest)
    );
    if (result.MessageId) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: result,
      };
    }
  }

  async getQueueAttributes(
    queueUrl: string,
    attributeNames: QueueAttributeName[]
  ) {
    const getQueueAttributesRequest = {
      QueueUrl: queueUrl,
      AttributeNames: attributeNames,
    };

    const result = await this.client.send(
      new GetQueueAttributesCommand(getQueueAttributesRequest)
    );

    return result.Attributes;
  }
}
