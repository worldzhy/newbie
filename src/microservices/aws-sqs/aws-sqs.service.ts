import {Injectable} from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  GetQueueAttributesCommand,
  QueueAttributeName,
} from '@aws-sdk/client-sqs';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class AwsSqsService {
  private client: SQSClient;
  private queueUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.getOrThrow<string>(
      'microservices.aws-sqs.accessKeyId'
    );
    const secretAccessKey = this.configService.getOrThrow<string>(
      'microservices.aws-sqs.secretAccessKey'
    );
    const region = this.configService.getOrThrow<string>(
      'microservices.aws-sqs.region'
    );

    if (accessKeyId && secretAccessKey && region) {
      this.client = new SQSClient({
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        },
        region: region,
      });
    }

    this.queueUrl = this.configService.getOrThrow<string>(
      'microservices.aws-sqs.queueUrl'
    );
  }

  /**
   * See the API doc for more details:
   * https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html
   * @param {object} params
   * @returns {(Promise<{data: SQS.SendMessageResult | void;err: AWSError | void;}>)}
   * @memberof SqsService
   */
  async sendMessage(params: {
    queueUrl?: string;
    body: object;
    MessageGroupId?: string;
    MessageDeduplicationId?: string;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sendMessageRequest: any = {
      QueueUrl: params.queueUrl ?? this.queueUrl,
      MessageBody: JSON.stringify(params.body),
    };

    const {MessageGroupId, MessageDeduplicationId} = params;
    if (MessageGroupId) {
      sendMessageRequest.MessageGroupId = MessageGroupId;
    }

    if (MessageDeduplicationId) {
      sendMessageRequest.MessageDeduplicationId = MessageDeduplicationId;
    }

    return await this.client.send(new SendMessageCommand(sendMessageRequest));
  }

  async getQueueAttributes(params: {
    queueUrl?: string;
    attributeNames: QueueAttributeName[];
  }) {
    const getQueueAttributesRequest = {
      QueueUrl: params.queueUrl ?? this.queueUrl,
      AttributeNames: params.attributeNames,
    };

    const result = await this.client.send(
      new GetQueueAttributesCommand(getQueueAttributesRequest)
    );

    return result.Attributes;
  }
}
