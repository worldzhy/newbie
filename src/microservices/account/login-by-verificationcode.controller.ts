import {Controller, Post, Body, Res, NotFoundException} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Response} from 'express';
import {AccountService} from '@microservices/account/account.service';
import {GuardByVerificationCode} from '@microservices/account/security/passport/verification-code/verification-code.decorator';
import {AccessToken, VerificationCodeUse} from '@prisma/client';
import {NoGuard} from './security/passport/public/public.decorator';
import {
  NewbieException,
  NewbieExceptionType,
} from '@framework/exception/newbie.exception';
import {verifyEmail, verifyPhone} from '@toolkit/validators/user.validator';
import {UserService} from './user/user.service';
import {VerificationCodeService} from './verification-code/verification-code.service';
import {VerificationCodeEmailService} from './verification-code/email.service';
import {VerificationCodeSmsService} from './verification-code/sms.service';

@ApiTags('Account')
@Controller('account')
export class LoginByVerificationCodeController {
  constructor(
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly emailService: VerificationCodeEmailService,
    private readonly smsService: VerificationCodeSmsService
  ) {}

  // *
  // * Won't send message if the same email apply again within 1 minute.
  // *
  @NoGuard()
  @Post('send-verification-code')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: 'Reset password',
        value: {
          email: 'henry@inceptionpad.com',
          use: VerificationCodeUse.RESET_PASSWORD,
        },
      },
      b: {
        summary: 'Email login',
        value: {
          email: 'henry@inceptionpad.com',
          use: VerificationCodeUse.LOGIN_BY_EMAIL,
        },
      },
      c: {
        summary: 'Phone login',
        value: {
          phone: '13260000789',
          use: VerificationCodeUse.LOGIN_BY_PHONE,
        },
      },
    },
  })
  async sendVerificationCode(
    @Body() body: {email?: string; phone?: string; use: VerificationCodeUse}
  ): Promise<{secondsOfCountdown: number}> {
    if (body.email && verifyEmail(body.email)) {
      // return await this.accountService.sendVerificationCode({
      //   email: body.email,
      //   use: body.use,
      // });

      // [step 1] Check if the account exists.
      const user = await this.userService.findByAccount(body.email);
      if (!user) {
        throw new NotFoundException('Your account is not registered.');
      }

      // [step 2] Generate verification code.
      const verificationCode =
        await this.verificationCodeService.generateForEmail(
          body.email,
          body.use
        );

      // [step 3] Send verification code.
      await this.emailService.send({
        email: body.email,
        subject: 'Your Verificaiton Code',
        plainText:
          verificationCode.code +
          ' is your verification code valid for the next 10 minutes.',
        html:
          verificationCode.code +
          ' is your verification code valid for the next 10 minutes.',
      });
    } else if (body.phone && verifyPhone(body.phone)) {
      // [step 1] Check if the account exists.
      const user = await this.userService.findByAccount(body.phone);
      if (!user) {
        throw new NotFoundException('Your account is not registered.');
      }

      // [step 2] Generate verification code.
      const verificationCode =
        await this.verificationCodeService.generateForPhone(
          body.phone,
          body.use
        );

      // [step 3] Send verification code.
      await this.smsService.send({
        phone: body.phone,
        text: verificationCode.code,
      });
    } else {
      throw new NewbieException(NewbieExceptionType.ResetPassword_WrongInput);
    }

    return {
      secondsOfCountdown: this.verificationCodeService.timeoutMinutes * 60,
    };
  }

  /**
   * After a user is verified by auth guard, this 'login' function returns
   * a JWT to declare the user is authenticated.
   *
   * The 'account' parameter supports:
   * [1] email
   * [2] phone
   */
  @GuardByVerificationCode()
  @Post('login-by-verification-code')
  @ApiBearerAuth()
  @ApiBody({
    description:
      "The request body must contain 'account' and 'verificationCode' attributes. The 'account' accepts email or phone.",
    examples: {
      a: {
        summary: '1. Log in with email',
        value: {
          account: 'henry@inceptionpad.com',
          verificationCode: '123456',
        },
      },
      b: {
        summary: '2. Log in with phone',
        value: {
          account: '13960068008',
          verificationCode: '123456',
        },
      },
    },
  })
  async loginByVerificationCode(
    @Body() body: {account: string; verificationCode: string},
    @Res({passthrough: true}) response: Response
  ): Promise<AccessToken> {
    // [step 1] Login with verification code and generate tokens.
    const {accessToken, refreshToken} = await this.accountService.login(
      body.account
    );

    // [step 2] Send refresh token to cookie.
    const {token, cookie} = refreshToken;
    response.cookie(cookie.name, token, cookie.options);

    // [step 3] Send access token as response.
    return accessToken;
  }

  /* End */
}
