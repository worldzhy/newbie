import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {Response} from 'express';
import {getPrismaExceptionMessage} from '@framework/prisma/prisma.exception';

enum PrismaExceptionCode {
  PrismaClientKnownRequestError = 9001,
  PrismaClientUnknownRequestError = 9002,
  PrismaClientInitializationError = 9003,
  PrismaClientValidationError = 9004,
}

/**
 * @see [PrismaErrors] https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
 */
@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientRustPanicError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientValidationError
)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    let statusCode: HttpStatus = HttpStatus.OK;

    /*
     * PrismaClientKnownRequestError
     * Engine returns a known error related to the request
     */
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const {code, message} = exception;
      if (code.startsWith('P2')) {
        statusCode = HttpStatus.BAD_REQUEST;
      } else {
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      }

      response.status(statusCode).json({
        code: PrismaExceptionCode.PrismaClientKnownRequestError,
        error: {message: code + ' ' + getPrismaExceptionMessage(code, message)},
        data: null,
      });
    }

    /*
     * PrismaClientUnknownRequestError
     * Engine returns an error related to a request that does not have an error code
     */
    if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      response.status(HttpStatus.OK).json({
        code: PrismaExceptionCode.PrismaClientUnknownRequestError,
        error: {message: exception.message},
        data: null,
      });
    }

    /*
     * PrismaClientInitializationError
     * Something goes wrong when the query engine is started and the connection to the database is created
     */
    if (exception instanceof Prisma.PrismaClientInitializationError) {
      const {message} = exception;
      const code = exception.errorCode;
      if (code && code.startsWith('P2')) {
        statusCode = HttpStatus.BAD_REQUEST;
      } else {
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      }

      response.status(statusCode).json({
        code: PrismaExceptionCode.PrismaClientInitializationError,
        error: {message: code + ' ' + getPrismaExceptionMessage(code, message)},
        data: null,
      });
    }

    /*
     * PrismaClientValidationError
     * Validation fails
     */
    if (exception instanceof Prisma.PrismaClientValidationError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        code: PrismaExceptionCode.PrismaClientValidationError,
        error: {
          message:
            'Validation failed due to missing field, incorrect field name, incorrect field types, etc.',
        },
        data: null,
      });
    }
  }
}
