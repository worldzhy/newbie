import {Injectable} from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  GetQueueAttributesCommand,
  QueueAttributeName,
} from '@aws-sdk/client-sqs';
import {getAwsConfig} from '../_config/_aws.config';

@Injectable()
export class SqsService {
  private client: SQSClient;

  constructor() {
    this.client = new SQSClient({
      credentials: {
        accessKeyId: getAwsConfig().accessKeyId!,
        secretAccessKey: getAwsConfig().secretAccessKey!,
      },
      region: getAwsConfig().region,
    });
  }

  /**
   * See the API doc for more details:
   * https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html
   * @param {object} body
   * @returns {(Promise<{data: SQS.SendMessageResult | void;err: AWSError | void;}>)}
   * @memberof SqsService
   */
  async sendMessage(queueUrl: string, body: object) {
    const sendMessageRequest = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(body),
    };

    return await this.client.send(new SendMessageCommand(sendMessageRequest));
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
