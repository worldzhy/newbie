import {Injectable} from '@nestjs/common';
import {SendMessageCommand, SQSClient} from '@aws-sdk/client-sqs';
import {CommonConfig} from '../../_config/_common.config';

@Injectable()
export class SqsService {
  private client: SQSClient;

  constructor() {
    this.client = new SQSClient({
      region: CommonConfig.getRegion(), // region is required for SQS service.
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
  async sendMessage(queueUrl: string, messageBody: object) {
    const sendMessageRequest = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(messageBody),
    };
    console.log(sendMessageRequest);
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

    /*
    return await request
      .on('success', response => {
        console.log(response.data);
        console.log('~~~~~~~~~success~~~~~~~~~~~~');
      })
      .promise();

    await request
      .on('error', (err, response) => {
        console.log(err);
      })
      .promise(); */
  }
}
