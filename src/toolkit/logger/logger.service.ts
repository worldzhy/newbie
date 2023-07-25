import {ConsoleLogger, Injectable} from '@nestjs/common';
import {SqsService} from '../aws/aws.sqs.service';
import {ConfigService} from '@nestjs/config';

/**
 * [1] Logs in development environment will output to stdout.
 * [2] Logs in production environment will output to SQS to S3.
 *
 * @export
 * @class CustomLoggerService
 * @extends {ConsoleLogger}
 */
@Injectable()
export class CustomLoggerService extends ConsoleLogger {
  private environment: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly sqsService: SqsService
  ) {
    super();

    this.environment =
      this.configService.getOrThrow<string>('application.environment') ||
      'development';
  }

  // stdout
  debug(message: any, context?: string) {
    super.debug(message, context);
  }

  log(message: any, context?: string) {
    if (this.environment === 'development') {
      super.log(message, context);
    } else {
      this.sqsService.sendMessage({
        queueUrl: this.configService.getOrThrow<string>(
          'toolkit.logger.awsSqsQueueUrl'
        )!,
        body: {
          message: message,
          context: this.context,
        },
      });
    }
  }

  warn(message: any, context?: string) {
    if (this.environment === 'development') {
      super.warn(message, context);
    } else {
      this.sqsService.sendMessage({
        queueUrl: this.configService.getOrThrow<string>(
          'toolkit.logger.awsSqsQueueUrl'
        )!,
        body: {
          message: message,
          context: context,
          level: 'warn',
        },
      });
    }
  }

  error(message: any, context?: string) {
    if (this.environment === 'development') {
      super.error(message, context);
    } else {
      this.sqsService.sendMessage({
        queueUrl: this.configService.getOrThrow<string>(
          'toolkit.logger.awsSqsQueueUrl'
        )!,
        body: {
          message: message,
          context: context,
          level: 'error',
        },
      });
    }
  }

  // stdout
  verbose(message: any, context?: string) {
    super.verbose(message, context);
  }
}
