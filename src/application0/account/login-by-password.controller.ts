import {Controller, Post, Body, Res} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Response} from 'express';
import {AccountService} from '@microservices/account/account.service';
import {
  LimitLoginByIp,
  LimitLoginByUser,
} from '@microservices/account/security/rate-limiter/rate-limiter.decorator';
import {LoggingInByPassword} from '@microservices/account/security/authentication/password/password.decorator';
import {AccessToken} from '@prisma/client';

@ApiTags('Account')
@Controller('account')
export class LoginByPasswordController {
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
  @Post('login-by-password')
  @LimitLoginByIp()
  @LimitLoginByUser()
  @LoggingInByPassword()
  @ApiBearerAuth()
  @ApiBody({
    description:
      "The request body should contain 'account' and 'password' attributes.",
    examples: {
      a: {
        summary: '1. Log in with email',
        value: {account: 'admin@inceptionpad.com', password: 'Abc1234!'},
      },
      b: {
        summary: '2. Log in with phone',
        value: {account: '13960068008', password: 'Abc1234!'},
      },
    },
  })
  async loginByPassword(
    @Body() body: {account: string; password: string},
    @Res({passthrough: true}) response: Response
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

  /* End */
}