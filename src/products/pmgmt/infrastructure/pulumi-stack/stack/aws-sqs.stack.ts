import {Injectable} from '@nestjs/common';
import * as aws from '@pulumi/aws';
import {verifySqsQueueName} from '../../../../../_aws/_aws.validator';

@Injectable()
export class AwsSqs_Stack {
  static getStackParams() {
    return {
      queueName: 'default-queue-name',
    };
  }

  static checkStackParams(params: any) {
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
    let uniqueResourceName = 'queue';
    const queue = new aws.sqs.Queue(uniqueResourceName, {
      name: params.queueName,
    });

    return {
      queueUrl: queue.url,
      queueArn: queue.arn,
    };
  };
}
