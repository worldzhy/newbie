import { HttpException, HttpStatus } from "@nestjs/common";

export class NewbieException extends HttpException {
  constructor(type: NewbieExceptionType) {
    const exception = NewbieExceptionMap.get(type);
    if (exception) {
      super({ code: exception.code, error: exception.error }, exception.httpStatus);
    } else {
      // Unregistered type: never leave the exception without a super() call,
      // which would corrupt the instance (getResponse()/getStatus() throw).
      super({ code: 500, error: { message: "Unknown newbie exception type" } }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export enum NewbieExceptionType {
  Login_WrongInput,
  Login_InactiveUser,
  Login_NoPassword,
  Login_ExceededAttempts,
  Login_HighFrequency,
  ResetPassword_WrongInput,
  ResetPassword_InvalidCode,
  Access_HighFrequency,
}

// Each entry carries an explicit HTTP status (see ADR-001): recoverable
// credential-submission failures are 400 (RFC 6749 invalid_grant), account
// state failures are 403, and rate/attempt limits are 429. The business code
// keeps the product-level semantics inside the response envelope.
const NewbieExceptionMap = new Map<NewbieExceptionType, { code: number; httpStatus: number; error: object }>([
  [
    NewbieExceptionType.Login_WrongInput,
    {
      code: 1001,
      httpStatus: HttpStatus.BAD_REQUEST,
      error: { message: "Invalid combination of account and password" },
    },
  ],

  [
    NewbieExceptionType.Login_NoPassword,
    {
      code: 1002,
      httpStatus: HttpStatus.BAD_REQUEST,
      error: {
        message: "The password has not been set. Please login via verification code",
      },
    },
  ],
  [
    NewbieExceptionType.Login_ExceededAttempts,
    {
      code: 1003,
      httpStatus: HttpStatus.TOO_MANY_REQUESTS,
      error: {
        message: "Suspicious login prevented",
        description:
          "We blocked an attempt to access your account because we weren't sure it was really you. This happens when we notice unusual login activity, like an attempt to log in too many times, or from a different location or device. You'll need to wait before trying to log in again. Some blocks are removed automatically.",
      },
    },
  ],
  [
    NewbieExceptionType.Login_HighFrequency,
    {
      code: 1004,
      httpStatus: HttpStatus.TOO_MANY_REQUESTS,
      error: {
        message: "High frequency login prevented",
        description:
          "We blocked an attempt to access your account because we weren't sure it was you. This happens when we notice unusual login activity, like an attempt to log in too many times, or from a different location or device. You'll need to wait before trying to log in again. Some blocks are removed automatically.",
      },
    },
  ],
  [
    NewbieExceptionType.ResetPassword_WrongInput,
    {
      code: 1005,
      httpStatus: HttpStatus.BAD_REQUEST,
      error: { message: "Invalid email or phone" },
    },
  ],
  [
    NewbieExceptionType.ResetPassword_InvalidCode,
    {
      code: 1006,
      httpStatus: HttpStatus.BAD_REQUEST,
      error: { message: "Invalid verification code" },
    },
  ],
  [
    NewbieExceptionType.Login_InactiveUser,
    {
      code: 1007,
      httpStatus: HttpStatus.FORBIDDEN,
      error: {
        message: "You have closed your account, do you want to recover it?",
      },
    },
  ],
  [
    NewbieExceptionType.Access_HighFrequency,
    {
      code: 2001,
      httpStatus: HttpStatus.TOO_MANY_REQUESTS,
      error: {
        message: "High frequency http requests prevented",
        description:
          "We blocked an attempt to request your endpoints because we weren't sure it was you. This happens when we notice unusual login activity, like an attempt to log in too many times, or from a different location or device. You'll need to wait before trying to log in again later. Some blocks are removed automatically.",
      },
    },
  ],
]);
