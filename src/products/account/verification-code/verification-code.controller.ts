import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBody} from '@nestjs/swagger';
import {Public} from '../auth/auth-jwt/auth-jwt.decorator';
import {UserService} from '../user/user.service';
import {VerificationCodeService} from './verification-code.service';
import {VerificationCodeUse} from '@prisma/client';
import * as validator from '../account.validator';

@ApiTags('[Product] Account / Verification Code')
@Controller()
export class VerificationCodeController {
  private verificationCodeService = new VerificationCodeService();

  // *
  // * Won't send message if the same email apply again within 1 minute.
  // *
  @Post('verification-code/email/generate')
  @Public()
  @ApiBody({
    description:
      "Valid 'use' can be 'login-by-email', 'close-account-by-email', 'recover-account-by-email'...",
    examples: {
      a: {
        summary: '1. Login by email',
        value: {
          email: 'email@example.com',
          use: VerificationCodeUse.LOGIN_BY_EMAIL,
        },
      },
      b: {
        summary: '2. Close account by email',
        value: {
          email: 'email@example.com',
          use: VerificationCodeUse.CLOSE_ACCOUNT_BY_EMAIL,
        },
      },
    },
  })
  async send2Email(@Body() body: {email: string; use: VerificationCodeUse}) {
    const {email, use} = body;

    // [step 1] Guard statement.
    if (!validator.verifyEmail(email)) {
      return {err: {message: 'The email is invalid.'}};
    }

    if (
      use !== VerificationCodeUse.LOGIN_BY_EMAIL &&
      use !== VerificationCodeUse.CLOSE_ACCOUNT_BY_EMAIL &&
      use !== VerificationCodeUse.RECOVER_ACCOUNT_BY_EMAIL
    ) {
      return {err: {message: "The 'use' is invalid."}};
    }

    // [step 2] Check if the account exists.
    const userService = new UserService();
    const user = await userService.findByAccount(email);
    if (!user) {
      return {
        err: {message: 'Your account is not registered.'},
      };
    }

    // [step 3] Generate and send verification code.
    return await this.verificationCodeService.send2Email(email, use);
  }

  @Post('verification-code/email/validate')
  @Public()
  @ApiBody({
    description:
      "The request body must contain one of ['userId', 'email', 'phone'] and 'code'.",
    examples: {
      a: {
        summary: '1. Validate with email',
        value: {
          email: 'email@example.com',
          code: '123456',
        },
      },
    },
  })
  async validateWithEmail(
    @Body() body: {code: string; email: string}
  ): Promise<boolean> {
    // [step 1] Guard statement.
    const {code, email} = body;
    if (!code || !validator.verifyEmail(email)) {
      return false;
    }

    // [step 2] Check if the account exists.
    const userService = new UserService();
    const user = await userService.findByAccount(email);
    if (!user) {
      return false;
    }

    // [step 3] Validate code.
    return await this.verificationCodeService.validateWithEmail(code, email);
  }

  // *
  // * Won't send message if the same phone apply again within 1 minute.
  // *
  @Post('verification-code/text-message/generate')
  @Public()
  @ApiBody({
    description:
      "Valid 'use' can be 'login-by-phone', 'close-account-by-phone', 'recover-account-by-phone'...",
    examples: {
      a: {
        summary: '3. Recover account by phone',
        value: {
          phone: '13960068008',
          use: VerificationCodeUse.RECOVER_ACCOUNT_BY_PHONE,
        },
      },
    },
  })
  async send2TextMessage(
    @Body() body: {phone: string; use: VerificationCodeUse}
  ) {
    const {phone, use} = body;

    // [step 1] Guard statement.
    if (!validator.verifyPhone(phone)) {
      return {err: {message: 'The phone is invalid.'}};
    }

    if (
      use !== VerificationCodeUse.LOGIN_BY_PHONE &&
      use !== VerificationCodeUse.CLOSE_ACCOUNT_BY_PHONE &&
      use !== VerificationCodeUse.RECOVER_ACCOUNT_BY_PHONE
    ) {
      return {err: {message: "The 'use' is invalid."}};
    }

    // [step 2] Check if the account exists.
    const userService = new UserService();
    const user = await userService.findByAccount(phone);
    if (!user) {
      return {
        err: {message: 'Your account is not registered.'},
      };
    }

    // [step 3] Generate verification code.
    return await this.verificationCodeService.send2Phone(phone, use);
  }

  @Post('verification-code/text-message/validate')
  @Public()
  @ApiBody({
    description:
      "The request body must contain one of ['userId', 'email', 'phone'] and 'code'.",
    examples: {
      a: {
        summary: '2. Validate with phone',
        value: {
          phone: '13960068008',
          code: '123456',
        },
      },
    },
  })
  async validateWithPhone(
    @Body() body: {code: string; phone: string}
  ): Promise<boolean> {
    // [step 1] Validate phone.
    const {code, phone} = body;
    if (!code || !validator.verifyPhone(phone)) {
      return false;
    }

    // [step 2] Check if the account exists.
    const userService = new UserService();
    const user = await userService.findByAccount(phone);
    if (!user) {
      return false;
    }

    // [step 3] Validate code.
    return await this.verificationCodeService.validateWithPhone(code, phone);
  }
  /* End */
}
