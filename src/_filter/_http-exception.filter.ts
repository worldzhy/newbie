import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import {Request, Response} from 'express';
import {CustomLoggerService} from '../_logger/_logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new CustomLoggerService('HttpException');

  catch(exception: HttpException, host: ArgumentsHost) {
    const statusCode = exception.getStatus(); // such as: 401
    const statusName = exception.name; // such as: UnauthorizedException
    const message = exception.message;

    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();

    // [step 1] Assemble log content.
    let content = `${statusCode} ${statusName} >> ${request.method} ${request.url}`;

    if (request.body && Object.keys(request.body).length > 0) {
      content += ` ${JSON.stringify(request.body)}`;
    }
    content += ` >> ${message}`;

    // [step 2] Write log.
    if (statusCode >= 500) {
      this.logger.error(content);
    } else if (statusCode >= 400) {
      this.logger.warn(content);
    } else {
      this.logger.log(content);
    }

    // [step 3] Response.
    response.status(statusCode).json({
      StatusCode: statusCode,
      Message: message,
      Time: new Date().toISOString(),
    });
  }
}
