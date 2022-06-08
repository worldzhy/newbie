import {ConsoleLogger} from '@nestjs/common';
import {SqsService} from '../_aws/_sqs/_sqs.service';
import {CommonConfig} from '../_config/_common.config';
import {AwsConfig} from '../_config/_aws.config';
import {Enum} from '../_config/_common.enum';

/**
 * [1] Logs in development environment will output to stdout.
 * [2] Logs in production environment will output to SQS to S3.
 *
 * @export
 * @class CustomLoggerService
 * @extends {ConsoleLogger}
 */
export class CustomLoggerService extends ConsoleLogger {
  private env = CommonConfig.getEnvironment();
  private queueUrl = AwsConfig.getSqsLoggerQueueUrl();
  private sqs = new SqsService();

  constructor(context: string) {
    super(context);
  }

  // stdout
  debug(message: any) {
    super.debug(message, this.context);
  }

  log(message: any, ...optionalParams: any[]) {
    if (this.env === Enum.environment.DEVELOPMENT) {
      super.log(message, ...optionalParams);
    } else {
      this.sqs.sendMessage(this.queueUrl, {
        message: message,
        context: this.context,
        ...optionalParams,
      });
    }
  }

  warn(message: any, ...optionalParams: any[]) {
    if (this.env === Enum.environment.DEVELOPMENT) {
      super.warn(message, ...optionalParams);
    } else {
      this.sqs.sendMessage(this.queueUrl, {
        message: message,
        context: this.context,
        level: 'warn',
      });
    }
  }

  error(message: any, ...optionalParams: any[]) {
    if (this.env === Enum.environment.DEVELOPMENT) {
      super.error(message, ...optionalParams);
    } else {
      this.sqs.sendMessage(this.queueUrl, {
        message: message,
        context: this.context,
        level: 'error',
      });
    }
  }

  // stdout
  verbose(message: any) {
    super.verbose(message, this.context);
  }
}
