import {
  Catch,
  Logger,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import {Request, Response} from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private loggerContext = 'HttpException';

  constructor(private readonly logger: Logger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();
    const httpStatus = exception.getStatus(); // such as: 401
    const message = exception.message;

    // [step 1] Assemble log content.
    let content = `${request.method} ${request.url}`;
    if (request.body && Object.keys(request.body).length > 0) {
      content += ` ${JSON.stringify(request.body)}`;
    }
    content += ` >> ${message}`;

    // [step 2] Write log.
    if (httpStatus >= 500) {
      this.logger.error(content, this.loggerContext);
    } else if (httpStatus >= 400) {
      this.logger.warn(content, this.loggerContext);
    } else {
      this.logger.log(content, this.loggerContext);
    }

    // [step 3] Response.
    response.status(httpStatus).json({
      code: httpStatus,
      error: {message, info: exception.getResponse()},
      data: null,
    });
  }
}
