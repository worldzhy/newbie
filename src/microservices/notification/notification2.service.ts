import {Injectable} from '@nestjs/common';
import {SqsService} from '@toolkit/aws/aws.sqs.service';

@Injectable()
export class Notification2Service {
  constructor(private readonly sqs: SqsService) {}

  async sendEmail(params: {
    queueUrl: string;
    body: {toAddress: string; subject: string; content: string};
  }) {
    await this.sqs.sendMessage(params);
  }
}
