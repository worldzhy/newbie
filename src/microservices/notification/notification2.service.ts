import {Injectable} from '@nestjs/common';
import {AwsSqsService} from '@microservices/cloud/saas/aws/aws-sqs.service';

@Injectable()
export class Notification2Service {
  constructor(private readonly sqs: AwsSqsService) {}

  async sendEmail(params: {
    queueUrl: string;
    body: {toAddress: string; subject: string; content: string};
  }) {
    await this.sqs.sendMessage(params);
  }
}
