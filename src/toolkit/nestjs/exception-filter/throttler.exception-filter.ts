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
    const response = host.switchToHttp().getResponse<Response>();

    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      code: HttpStatus.TOO_MANY_REQUESTS,
      error: {message: 'Too many requests. Please try again later.'},
      data: null,
    });
  }
}
