import {Inject, Injectable} from '@nestjs/common';
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
  private queueUrl: string;

  constructor(@Inject('SqsConfiguration') config: {queueUrl: string}) {
    this.client = new SQSClient({
      region: AwsConfig.getRegion(), // region is required for SQS service.
    });

    this.queueUrl = config.queueUrl;
  }

  /**
   * See the API doc for more details:
   * https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html
   * @param {object} body
   * @returns {(Promise<{data: SQS.SendMessageResult | void;err: AWSError | void;}>)}
   * @memberof SqsService
   */
  async sendMessage(body: object) {
    const sendMessageRequest = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(body),
    };

    return await this.client.send(new SendMessageCommand(sendMessageRequest));
  }

  async getQueueAttributes(attributeNames: QueueAttributeName[]) {
    const getQueueAttributesRequest = {
      QueueUrl: this.queueUrl,
      AttributeNames: attributeNames,
    };

    const result = await this.client.send(
      new GetQueueAttributesCommand(getQueueAttributesRequest)
    );

    return result.Attributes;
  }
}
