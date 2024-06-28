import {HttpException, HttpStatus} from '@nestjs/common';

export class NewbieException extends HttpException {
  constructor(type: NewbieExceptionType) {
    const exception = NewbieExceptionMap.get(type);
    if (exception) {
      super({status: exception.code, error: exception.error}, HttpStatus.OK);
    }
  }
}

export enum NewbieExceptionType {
  Login_WrongInput,
  Login_NoPassword,
  Login_ExceededAttempts,
  Login_HighFrequency,
  ResetPassword_WrongInput,
  ResetPassword_InvalidCode,
  Access_HighFrequency,
}

const NewbieExceptionMap = new Map<
  NewbieExceptionType,
  {code: number; error: object}
>([
  [
    NewbieExceptionType.Login_WrongInput,
    {
      code: 1001,
      error: {message: 'Invalid combination of account and password'},
    },
  ],
  [
    NewbieExceptionType.Login_NoPassword,
    {
      code: 1002,
      error: {
        message:
          'The password has not been set. Please login via verification code',
      },
    },
  ],
  [
    NewbieExceptionType.Login_ExceededAttempts,
    {
      code: 1003,
      error: {
        message: 'Suspicious login prevented',
        description:
          "We blocked an attempt to access your account because we weren't sure it was really you. This happens when we notice unusual login activity, like an attempt to log in too many times, or from a different location or device. You'll need to wait before trying to log in again. Some blocks are removed automatically.",
      },
    },
  ],
  [
    NewbieExceptionType.Login_HighFrequency,
    {
      code: 1004,
      error: {
        message: 'High frequency login prevented',
        description:
          "We blocked an attempt to access your account because we weren't sure it was really you. This happens when we notice unusual login activity, like an attempt to log in too many times, or from a different location or device. You'll need to wait before trying to log in again. Some blocks are removed automatically.",
      },
    },
  ],
  [
    NewbieExceptionType.ResetPassword_WrongInput,
    {code: 1005, error: {message: 'Invalid email or phone'}},
  ],
  [
    NewbieExceptionType.ResetPassword_InvalidCode,
    {code: 1006, error: {message: 'Invalid verification code'}},
  ],
  [
    NewbieExceptionType.Access_HighFrequency,
    {
      code: 2001,
      error: {
        message: 'High frequency http requests prevented',
        description:
          "We blocked an attempt to request your endpoints because we weren't sure it was really you. This happens when we notice unusual login activity, like an attempt to log in too many times, or from a different location or device. You'll need to wait before trying to log in again. Some blocks are removed automatically.",
      },
    },
  ],
]);
