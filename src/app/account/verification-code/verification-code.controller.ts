import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBody} from '@nestjs/swagger';
import {Public} from '../auth/auth-jwt/auth-jwt.decorator';
import {MessageTrackerService} from '../../mtrac/mtrac.service';
import {UserService} from '../user/user.service';
import {AccountValidator} from '../../../_validator/_account.validator';
import {VerificationCodeService} from './verification-code.service';
import {VerificationCodeUse} from '@prisma/client';

@ApiTags('App / Account / Verification Code')
@Controller()
export class VerificationCodeController {
  private verificationCodeService = new VerificationCodeService();

  /**
   * [1] Account parameter must be email or phone.
   * [2] Won't success if the same user apply again within 1 minute.
   *
   * @param {{account: string; use: string}} body
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof AccountController
   */
  @Post('verification-code/apply')
  @Public()
  @ApiBody({
    description:
      "The request body must contain 'account' and 'use' attributes. Valid 'use' can be 'login-by-email', 'login-by-phone', 'close-account-by-email', 'close-account-by-phone', 'recover-account-by-email', 'recover-account-by-phone'...",
    examples: {
      a: {
        summary: '1. Login by email',
        value: {
          account: 'email@example.com',
          use: VerificationCodeUse.LOGIN_BY_EMAIL,
        },
      },
      b: {
        summary: '2. Close account by email',
        value: {
          account: 'email@example.com',
          use: VerificationCodeUse.CLOSE_ACCOUNT_BY_EMAIL,
        },
      },
      c: {
        summary: '3. Recover account by phone',
        value: {
          account: '13960068008',
          use: VerificationCodeUse.RECOVER_ACCOUNT_BY_PHONE,
        },
      },
    },
  })
  async apply(
    @Body() body: {account: string; use: string}
  ): Promise<{data: object | null; err: object | null}> {
    const {account, use} = body;
    const byEmail = account ? AccountValidator.verifyEmail(account) : null;
    const byPhone = account ? AccountValidator.verifyPhone(account) : null;

    // [step 1] Validate email/phone and verificaiton code use.
    if (!byEmail && !byPhone) {
      return {
        data: null,
        err: {
          message: "The request body must contain valid 'account' attribute.",
        },
      };
    }
    if (
      use !== VerificationCodeUse.LOGIN_BY_EMAIL &&
      use !== VerificationCodeUse.LOGIN_BY_PHONE &&
      use !== VerificationCodeUse.CLOSE_ACCOUNT_BY_EMAIL &&
      use !== VerificationCodeUse.CLOSE_ACCOUNT_BY_PHONE &&
      use !== VerificationCodeUse.RECOVER_ACCOUNT_BY_EMAIL &&
      use !== VerificationCodeUse.RECOVER_ACCOUNT_BY_PHONE
    ) {
      return {
        data: null,
        err: {
          message: "The request body must contain valid 'use' attribute.",
        },
      };
    }

    // [step 2] Check if the account exists.
    const userService = new UserService();
    const user = await userService.findByAccount(account);
    if (!user) {
      return {
        data: null,
        err: {
          message: 'Your account is not registered.',
        },
      };
    }

    // [step 3] Generate verification code.
    const res = await this.verificationCodeService.generate({
      userId: user.id,
      use: use,
    });
    if (!res.data) {
      return res;
    }
    const {createdAt, updatedAt, ...others} = res.data;
    const verificationCode = others;

    // [step 4: start] Send verification code.
    let result: {data: object | null; err: object | null};
    const messageService = new MessageTrackerService();
    if (byEmail) {
      // Send verification code to user's email
      const subject = 'Your Verification Code';
      const content = verificationCode.code;
      const toAddress = account;
      result = await messageService.sendEmail(subject, content, toAddress);
    } else if (byPhone) {
      // Send verification code to user's phone
      const content = verificationCode.code;
      const phone = account;
      result = await messageService.sendSms(content, phone);
    } else {
      // No chance to arrive here.
      result = {data: null, err: null};
    }

    if (result.data) {
      // [step 4: successful]
      return {
        data: verificationCode,
        err: null,
      };
    } else {
      // [step 4: failed]
      return {
        data: null,
        err: {
          message:
            'Apply verification code successfully, but send verification code failed.',
        },
      };
    }
  }

  @Post('verification-code/validate')
  @Public()
  @ApiBody({
    description:
      "The request body must contain one of ['userId', 'email', 'phone'] and 'code'.",
    examples: {
      a: {
        summary: '1. Validate with email',
        value: {
          account: 'email@example.com',
          code: '123456',
        },
      },
      b: {
        summary: '2. Validate with phone',
        value: {
          account: '13960068008',
          code: '123456',
        },
      },
    },
  })
  async validate(
    @Body() body: {account: string; code: string}
  ): Promise<boolean> {
    const {account, code} = body;
    const byEmail = account ? AccountValidator.verifyEmail(account) : null;
    const byPhone = account ? AccountValidator.verifyPhone(account) : null;

    // [step 1] Validate email/phone.
    if ((!byEmail && !byPhone) || !code) {
      return false;
    }

    // [step 2] Check if the account exists.
    const userService = new UserService();
    const user = await userService.findByAccount(account);
    if (!user) {
      return false;
    }

    return await this.verificationCodeService.validate(body);
  }

  /* End */
}
