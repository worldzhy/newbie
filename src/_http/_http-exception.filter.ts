import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import {Request, Response} from 'express';
import {CustomLoggerService} from '../_logger/_custom-logger.service';
import {Util} from '../_common/_common.util';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new CustomLoggerService('HttpException');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();

    // [step 1] Assemble log message.
    let message = `${statusCode} ${exception.message} ${request.method} ${request.url} `;
    if (request.body) {
      message += `${Util.stringfy(request.body)}`;
    }

    // [step 2] Write log.
    if (statusCode >= 500) {
      this.logger.error(message);
    } else if (statusCode >= 400) {
      this.logger.warn(message);
    } else {
      this.logger.log(message);
    }

    // [step 3] Response.
    response.status(statusCode).json({
      statusCode: statusCode,
      uri: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
