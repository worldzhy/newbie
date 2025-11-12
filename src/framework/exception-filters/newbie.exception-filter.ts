import {Catch, ArgumentsHost, ExceptionFilter, HttpStatus} from '@nestjs/common';
import {Response} from 'express';
import {NewbieException} from '../exceptions/newbie.exception';

@Catch(NewbieException)
export class NewbieExceptionFilter implements ExceptionFilter {
  catch(exception: NewbieException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const {code, error} = exception.getResponse() as {
      code: number;
      error: object;
    };

    response.status(HttpStatus.OK).json({code, error, data: null});
  }
}
