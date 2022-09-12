import {Injectable} from '@nestjs/common';
import {Enum} from './_common.enum';

@Injectable()
export class AwsConfig {
  // This function is no longer needed because https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-node-credentials-environment.html
  static getCredentials = () => {
    if (process.env.ENVIRONMENT === Enum.environment.DEVELOPMENT) {
      return {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    } else {
      return null;
    }
  };

  static getRegion = () => {
    if (typeof process.env.AWS_REGION === 'string') {
      return process.env.AWS_REGION;
    } else {
      return 'environment variable AWS_REGION is invalid.';
    }
  };

  static getSqsLoggerQueueUrl = (): string => {
    if (typeof process.env.SQS_LOGGER_QUEUE_URL === 'string') {
      return process.env.SQS_LOGGER_QUEUE_URL;
    } else {
      return 'environment variable SQS_LOGGER_QUEUE_URL is invalid.';
    }
  };

  static getSqsEmailQueueUrl = (): string => {
    if (typeof process.env.SQS_EMAIL_QUEUE_URL === 'string') {
      return process.env.SQS_EMAIL_QUEUE_URL;
    } else {
      return 'environment variable SQS_EMAIL_QUEUE_URL is invalid.';
    }
  };

  static getSqsSmsQueueUrl = (): string => {
    if (typeof process.env.SQS_SMS_QUEUE_URL === 'string') {
      return process.env.SQS_SMS_QUEUE_URL;
    } else {
      return 'environment variable SQS_SMS_QUEUE_URL is invalid.';
    }
  };
}
