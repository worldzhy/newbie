import {HttpException, HttpStatus} from '@nestjs/common';

export class NewbieException extends HttpException {
  constructor(status: NewbieExceptionStatus) {
    const exception = NewbieExceptionMap.get(status);
    if (exception) {
      super({status: exception.status, error: exception.error}, HttpStatus.OK);
    }
  }
}

export enum NewbieExceptionStatus {
  Login_WrongInput,
  Login_NoPassword,
  Login_ExceededAttempts,
  Login_HighFrequency,
  Access_HighFrequency,
}

const NewbieExceptionMap = new Map<
  NewbieExceptionStatus,
  {status: string; error: object}
>([
  [
    NewbieExceptionStatus.Login_WrongInput,
    {
      status: 'L1001',
      error: {message: 'Invalid combination of account and password'},
    },
  ],
  [
    NewbieExceptionStatus.Login_NoPassword,
    {
      status: 'L1002',
      error: {
        message:
          'The password has not been set. Please login via verification code',
      },
    },
  ],
  [
    NewbieExceptionStatus.Login_ExceededAttempts,
    {
      status: 'L1003',
      error: {
        message: 'Suspicious login prevented',
        description:
          "We blocked an attempt to access your account because we weren't sure it was really you. This happens when we notice unusual login activity, like an attempt to log in too many times, or from a different location or device. You'll need to wait before trying to log in again. Some blocks are removed automatically.",
      },
    },
  ],
  [
    NewbieExceptionStatus.Login_HighFrequency,
    {
      status: 'L1004',
      error: {
        message: 'High frequency login prevented',
        description:
          "We blocked an attempt to access your account because we weren't sure it was really you. This happens when we notice unusual login activity, like an attempt to log in too many times, or from a different location or device. You'll need to wait before trying to log in again. Some blocks are removed automatically.",
      },
    },
  ],
  [
    NewbieExceptionStatus.Access_HighFrequency,
    {
      status: 'L2001',
      error: {
        message: 'High frequency access prevented',
        description:
          "We blocked an attempt to access your account because we weren't sure it was really you. This happens when we notice unusual login activity, like an attempt to log in too many times, or from a different location or device. You'll need to wait before trying to log in again. Some blocks are removed automatically.",
      },
    },
  ],
]);
