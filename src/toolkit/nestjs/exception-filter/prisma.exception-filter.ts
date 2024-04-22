import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {Response} from 'express';
import {getPrismaExceptionMessage} from '@toolkit/prisma/prisma.exception';

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
    let errorCode: string | undefined;
    let errorMessage: string | undefined;

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

      errorCode = code;
      errorMessage = getPrismaExceptionMessage(code, message);
    }

    /*
     * PrismaClientUnknownRequestError
     * Engine returns an error related to a request that does not have an error code
     */
    if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      errorMessage = exception.message;
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

      errorCode = code;
      errorMessage = getPrismaExceptionMessage(errorCode, message);
    }

    /*
     * PrismaClientValidationError
     * Validation fails
     */
    if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorMessage =
        'Validation failed due to missing field, incorrect field name, incorrect field types, etc.';
    }

    response.status(statusCode).json({
      status: errorCode ?? 'HTTP ' + statusCode,
      error: {message: errorMessage},
      data: null,
    });
  }
}
