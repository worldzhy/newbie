import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {Response} from 'express';

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
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Set HTTP status code
      if (exception.code.startsWith('P1')) {
        // Common errors
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      } else if (exception.code.startsWith('P2')) {
        // Prisma Client (Query Engine) errors
        statusCode = HttpStatus.BAD_REQUEST;
      } else if (exception.code.startsWith('P3')) {
        // Prisma Migrate (Migration Engine) errors
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      } else if (exception.code.startsWith('P4')) {
        // prisma db pull (Introspection Engine) errors
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      } else {
        statusCode = HttpStatus.OK;
      }
      console.log(host);
      // HTTP response
      response.status(statusCode).json({
        StatusCode: statusCode,
        PrismaCode: exception.code,
        meta: exception.meta,
      });
    } else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      // HTTP response
      response.status(400).json({
        PrismaVersion: exception.clientVersion,
        message: exception.message,
      });
    } else if (exception instanceof Prisma.PrismaClientRustPanicError) {
      // HTTP response
      response.status(HttpStatus.BAD_REQUEST).json({
        StatusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      });
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      // Set HTTP status code
      if (exception.errorCode?.startsWith('P1')) {
        // Common errors
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      } else if (exception.errorCode?.startsWith('P2')) {
        // Prisma Client (Query Engine) errors
        statusCode = HttpStatus.BAD_REQUEST;
      } else if (exception.errorCode?.startsWith('P3')) {
        // Prisma Migrate (Migration Engine) errors
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      } else if (exception.errorCode?.startsWith('P4')) {
        // prisma db pull (Introspection Engine) errors
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      } else {
        statusCode = HttpStatus.OK;
      }

      // HTTP response
      response.status(statusCode).json({
        StatusCode: statusCode,
        PrismaCode: exception.errorCode,
        message: exception.message,
      });
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      // HTTP response
      response.status(HttpStatus.BAD_REQUEST).json({
        StatusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      });
    } else {
      // The PrismaExceptionFilter can not handle the exception.
      // Throw this exception for other exception filters to handle.
      throw exception;
    }
  }
}
