import { Catch, Logger, ArgumentsHost, ExceptionFilter, HttpException } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {
    this.logger = new Logger("HttpException");
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();
    const httpStatus = exception.getStatus(); // such as: 401
    const message = exception.message;

    // Log the request line and error message only. The request body is
    // deliberately excluded: failed login bodies carry passwords and other
    // credentials that would otherwise be written to the logs.
    const content = `${request.method} ${request.url} >> ${message}`;

    if (httpStatus >= 500) {
      this.logger.error(content);
    } else if (httpStatus >= 400) {
      this.logger.warn(content);
    } else {
      this.logger.log(content);
    }

    response.status(httpStatus).json({
      code: httpStatus,
      error: { message, info: exception.getResponse() },
      data: null,
    });
  }
}
