import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import {Response} from 'express';
import {NewbieException} from '../exception/newbie.exception';

@Catch(NewbieException)
export class NewbieExceptionFilter implements ExceptionFilter {
  catch(exception: NewbieException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const {status, error} = exception.getResponse() as {
      status: string;
      error: object;
    };

    response.status(HttpStatus.OK).json({status, error, data: null});
  }
}
