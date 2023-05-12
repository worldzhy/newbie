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
  Prisma.NotFoundError,
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
    if (exception instanceof Prisma.NotFoundError) {
      statusCode = HttpStatus.NOT_FOUND;

      // HTTP response
      response.status(statusCode).json({
        message: exception.message,
        statusCode: statusCode,
      });
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Set HTTP status code
      if (exception.code.startsWith('P1')) {
        // Common errors
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      } else if (exception.code.startsWith('P2')) {
        // Prisma Client (Query Engine) errors
        statusCode = HttpStatus.BAD_REQUEST;
        if (exception.code === 'P2002') {
          return response.status(statusCode).json({
            message: `The ${exception.meta!.target} is already existed.`,
            statusCode: statusCode,
          });
        } else if (exception.code === 'P2025') {
          return response.status(statusCode).json({
            message: exception.meta!.cause,
            statusCode: statusCode,
          });
        }
      } else if (exception.code.startsWith('P3')) {
        // Prisma Migrate (Migration Engine) errors
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      } else if (exception.code.startsWith('P4')) {
        // prisma db pull (Introspection Engine) errors
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      } else {
        statusCode = HttpStatus.OK;
      }

      // HTTP response
      response.status(statusCode).json({
        message: exception.meta,
        statusCode: statusCode,
        prismaCode: exception.code,
      });
    } else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      // HTTP response
      response.status(400).json({
        message: exception.message,
        statusCode: 400,
        prismaVersion: exception.clientVersion,
      });
    } else if (exception instanceof Prisma.PrismaClientRustPanicError) {
      // HTTP response
      response.status(HttpStatus.BAD_REQUEST).json({
        message: exception.message,
        statusCode: HttpStatus.BAD_REQUEST,
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
        message: exception.message,
        statusCode: statusCode,
        prismaCode: exception.errorCode,
      });
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      // HTTP response
      response.status(HttpStatus.BAD_REQUEST).json({
        // message: exception.message,
        message:
          'Validation failed due to missing, incorrect field types, etc.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    } else {
      // The PrismaExceptionFilter can not handle the exception.
      // Throw this exception for other exception filters to handle.
      throw exception;
    }
  }
}
