import {Injectable} from '@nestjs/common';
import * as aws from '@pulumi/aws';
import {verifySqsQueueName} from '@toolkit/validators/aws.validator';

@Injectable()
export class AwsSqs_Stack {
  static getStackParams() {
    return {
      queueName: 'default-queue-name',
    };
  }

  static checkStackParams(params: {queueName: string}) {
    if (params.queueName) {
      return verifySqsQueueName(params.queueName) ? true : false;
    }
    return false;
  }

  static getStackOutputKeys() {
    return ['queueUrl', 'queueArn'];
  }

  static getStackProgram = (params: {queueName: string}) => async () => {
    // Create a queue.
    const uniqueResourceName = 'queue';
    const queue = new aws.sqs.Queue(uniqueResourceName, {
      name: params.queueName,
    });

    return {
      queueUrl: queue.url,
      queueArn: queue.arn,
    };
  };
}
