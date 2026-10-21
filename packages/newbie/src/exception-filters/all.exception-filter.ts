import { ArgumentsHost, Catch, Logger } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";

/**
 * Catch-all filter for exceptions no more specific filter handled.
 *
 * HttpExceptionFilter, PrismaExceptionFilter, NewbieExceptionFilter and
 * ThrottlerExceptionFilter each claim their own exception kinds; anything
 * that falls through to here is genuinely unexpected and must be logged —
 * the default BaseExceptionFilter would otherwise return a 500 without
 * leaving any trace of the cause.
 */
@Catch()
export class AllExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger("AllExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    super.catch(exception, host);
  }
}
