import {Catch, ArgumentsHost} from '@nestjs/common';
import {BaseExceptionFilter} from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.log('!!!!  AllExceptionsFilter  !!!!!');
    super.catch(exception, host);
  }
}
