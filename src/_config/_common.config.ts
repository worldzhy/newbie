import {Injectable} from '@nestjs/common';
import {Enum} from './_common.enum';

@Injectable()
export class CommonConfig {
  static getJwtSecret = () => {
    if (typeof process.env.JWT_SECRET === 'string') {
      return process.env.JWT_SECRET;
    } else {
      return 'environment variable JWT_SECRET is invalid.';
    }
  };

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

  static getEnvironment = () => {
    if (typeof process.env.ENVIRONMENT === 'string') {
      return process.env.ENVIRONMENT;
    } else {
      return 'environment variable ENVIRONMENT is invalid.';
    }
  };

  static getRegion = () => {
    if (typeof process.env.AWS_REGION === 'string') {
      return process.env.AWS_REGION;
    } else {
      return 'environment variable AWS_REGION is invalid.';
    }
  };

  static getPulumiAwsVersion = () => {
    if (typeof process.env.PULUMI_AWS_VERSION === 'string') {
      return process.env.PULUMI_AWS_VERSION;
    } else {
      return 'environment variable PULUMI_AWS_VERSION is invalid.';
    }
  };

  static getPulumiAccessToken = () => {
    if (typeof process.env.PULUMI_ACCESS_TOKEN === 'string') {
      return process.env.PULUMI_ACCESS_TOKEN;
    } else {
      return 'environment variable PULUMI_ACCESS_TOKEN is invalid.';
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

  static getPinpointAppId = (): string => {
    if (typeof process.env.PINPOINT_APP_ID === 'string') {
      return process.env.PINPOINT_APP_ID;
    } else {
      return 'environment variable PINPOINT_APP_ID is invalid.';
    }
  };

  static getPinpointEmailFromAddress = (): string => {
    if (typeof process.env.PINPOINT_EMAIL_FROM_ADDRESS === 'string') {
      return process.env.PINPOINT_EMAIL_FROM_ADDRESS;
    } else {
      return 'environment variable PINPOINT_EMAIL_FROM_ADDRESS is invalid.';
    }
  };

  static getPinpointSmsSenderId = (): string => {
    if (typeof process.env.PINPOINT_SMS_SENDER_ID === 'string') {
      return process.env.PINPOINT_SMS_SENDER_ID;
    } else {
      return 'environment variable PINPOINT_SMS_SENDER_ID is invalid.';
    }
  };
}
