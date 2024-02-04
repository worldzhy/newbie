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
    let statusCode: HttpStatus;

    /*
     * PrismaClientKnownRequestError
     * Engine returns a known error related to the request
     */
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const {code, message} = exception;
      switch (true) {
        // Common errors
        case code.startsWith('P1'):
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
        // Client (Query Engine) errors
        case code.startsWith('P2'):
          statusCode = HttpStatus.BAD_REQUEST;
          break;
        // Migrate (Schema Engine) errors
        case code.startsWith('P3'):
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
        // DB pull errors
        case code.startsWith('P4'):
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
        // Data Proxy errors
        case code.startsWith('P5'):
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
        // Other errors
        default:
          statusCode = HttpStatus.OK;
          break;
      }
      response.status(statusCode).json({
        message: getPrismaExceptionMessage(code, message),
        statusCode,
      });
      return;
    }

    /*
     * PrismaClientUnknownRequestError
     * Engine returns an error related to a request that does not have an error code
     */
    if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        message: exception.message,
        statusCode: HttpStatus.BAD_REQUEST,
      });
      return;
    }

    /*
     * PrismaClientRustPanicError
     * Engine crashes and exits with a non-zero exit code
     */
    if (exception instanceof Prisma.PrismaClientRustPanicError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        message: exception.message,
        statusCode: HttpStatus.BAD_REQUEST,
      });
      return;
    }

    /*
     * PrismaClientInitializationError
     * Something goes wrong when the query engine is started and the connection to the database is created
     */
    if (exception instanceof Prisma.PrismaClientInitializationError) {
      const {errorCode, message} = exception;
      switch (true) {
        // Common errors
        case errorCode?.startsWith('P1'):
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
        // Client (Query Engine) errors
        case errorCode?.startsWith('P2'):
          statusCode = HttpStatus.BAD_REQUEST;
          break;
        // Migrate (Schema Engine) errors
        case errorCode?.startsWith('P3'):
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
        // DB pull errors
        case errorCode?.startsWith('P4'):
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
        // Data Proxy errors
        case errorCode?.startsWith('P5'):
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
        // Other errors
        default:
          statusCode = HttpStatus.OK;
          break;
      }
      response.status(statusCode).json({
        message: getPrismaExceptionMessage(errorCode, message),
        statusCode,
      });
      return;
    }

    /*
     * PrismaClientValidationError
     * Validation fails
     */
    if (exception instanceof Prisma.PrismaClientValidationError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        message:
          'Validation failed due to missing, incorrect field name, incorrect field types, etc.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
      return;
    }
  }
}
