import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  ExceptionFilter,
} from '@nestjs/common';
import {ThrottlerException} from '@nestjs/throttler';
import {Response} from 'express';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(_: ThrottlerException, host: ArgumentsHost) {
    const statusCode = HttpStatus.TOO_MANY_REQUESTS;
    const message = 'Too many requests. Please try again later.';

    const response = host.switchToHttp().getResponse<Response>();

    response.status(statusCode).json({
      message: message,
      statusCode: statusCode,
    });
  }
}
