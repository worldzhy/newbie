import {Controller, Post, Body, Res} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {AccessToken} from '@prisma/client';
import {Response} from 'express';
import {LoggingInByPassword} from '@microservices/account/security/authentication/password/password.decorator';
import {LoggingInByVerificationCode} from '@microservices/account/security/authentication/verification-code/verification-code.decorator';
import {AccountService} from '@microservices/account/account.service';
import {LoggingIn} from '@microservices/account/security/login-limiter/ip-login-limiter.decorator';

@ApiTags('Account')
@Controller('account')
export class AccountLoginController {
  constructor(private readonly accountService: AccountService) {}

  /**
   * After a user is verified by auth guard, this 'login' function returns
   * a JWT to declare the user is authenticated.
   *
   * The 'account' parameter supports:
   * [1] account
   * [2] email
   * [3] phone
   */

  @LoggingIn()
  @LoggingInByPassword()
  @Post('login-by-password')
  @ApiBearerAuth()
  @ApiBody({
    description:
      "The request body should contain 'account' and 'password' attributes.",
    examples: {
      a: {
        summary: '1. Log in with email',
        value: {
          account: 'admin@inceptionpad.com',
          password: 'Abc1234!',
        },
      },
      b: {
        summary: '2. Log in with phone',
        value: {
          account: '13960068008',
          password: 'Abc1234!',
        },
      },
    },
  })
  async loginByPassword(
    @Body()
    body: {
      account: string;
      password: string;
    },
    @Res({passthrough: true})
    response: Response
  ): Promise<AccessToken> {
    // [step 1] Login with password and generate tokens.
    const {accessToken, refreshToken} = await this.accountService.login(
      body.account
    );

    // [step 2] Send refresh token to cookie.
    const {name, token, cookieConfig} = refreshToken;
    response.cookie(name, token, cookieConfig);

    // [step 3] Send access token as response.
    return accessToken;
  }

  /**
   * The 'account' parameter supports:
   * [1] email
   * [2] phone
   */
  @LoggingIn()
  @LoggingInByVerificationCode()
  @Post('login-by-verification-code')
  @ApiBearerAuth()
  @ApiBody({
    description:
      "The request body must contain 'account' and 'verificationCode' attributes. The 'account' accepts email or phone.",
    examples: {
      a: {
        summary: '1. Log in with email',
        value: {
          account: 'email@example.com',
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
    @Body()
    body: {
      account: string;
      verificationCode: string;
    },
    @Res({passthrough: true})
    response: Response
  ): Promise<AccessToken> {
    // [step 1] Login with verification code and generate tokens.
    const {accessToken, refreshToken} = await this.accountService.login(
      body.account
    );

    // [step 2] Send refresh token to cookie.
    const {name, token, cookieConfig} = refreshToken;
    response.cookie(name, token, cookieConfig);

    // [step 3] Send access token as response.
    return accessToken;
  }

  /* End */
}
