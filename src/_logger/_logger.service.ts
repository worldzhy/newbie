import {ConsoleLogger} from '@nestjs/common';
import {getServerConfig} from '../_config/_server.config';
import {SqsService} from '../toolkits/aws/sqs.service';
import {getAwsSqsConfig} from '../toolkits/aws/sqs.config';

/**
 * [1] Logs in development environment will output to stdout.
 * [2] Logs in production environment will output to SQS to S3.
 *
 * @export
 * @class CustomLoggerService
 * @extends {ConsoleLogger}
 */
export class CustomLoggerService extends ConsoleLogger {
  private sqsService = new SqsService();
  private awsConfig = getAwsSqsConfig();

  constructor(context: string) {
    super(context);
  }

  // stdout
  debug(message: any) {
    super.debug(message, this.context);
  }

  log(message: any, ...optionalParams: any[]) {
    if (getServerConfig().environment === 'development') {
      super.log(message, ...optionalParams);
    } else {
      this.sqsService.sendMessage(this.awsConfig.sqsLogQueueUrl!, {
        message: message,
        context: this.context,
        ...optionalParams,
      });
    }
  }

  warn(message: any, ...optionalParams: any[]) {
    if (getServerConfig().environment === 'development') {
      super.warn(message, ...optionalParams);
    } else {
      this.sqsService.sendMessage(this.awsConfig.sqsLogQueueUrl!, {
        message: message,
        context: this.context,
        level: 'warn',
      });
    }
  }

  error(message: any, ...optionalParams: any[]) {
    if (getServerConfig().environment === 'development') {
      super.error(message, ...optionalParams);
    } else {
      this.sqsService.sendMessage(this.awsConfig.sqsLogQueueUrl!, {
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
