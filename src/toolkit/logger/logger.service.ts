import {ConsoleLogger, Injectable} from '@nestjs/common';

@Injectable()
export class CustomLoggerService extends ConsoleLogger {
  constructor() {
    super();
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
  }

  log(message: any, context?: string) {
    super.log(message, context);
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
  }

  error(message: any, context?: string) {
    super.error(message, context);
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context);
  }
}
