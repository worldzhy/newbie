import {Controller, Get, Res} from '@nestjs/common';
import {ApiTags, ApiCookieAuth} from '@nestjs/swagger';
import {Response} from 'express';
import {AccountService} from '@microservices/account/account.service';
import {RefreshTokenService} from '@microservices/token/refresh-token/refresh-token.service';
import {RefreshingAccessToken} from '@microservices/account/security/authentication/refresh-token/refresh-token.decorator';
import {Cookies} from '@_decorator/cookie.decorator';
import {AccessToken} from '@prisma/client';

@ApiTags('Account')
@Controller('account')
export class LoginRefreshController {
  constructor(
    private readonly accountService: AccountService,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  @RefreshingAccessToken()
  @Get('refresh-access-token')
  @ApiCookieAuth()
  async refresh(
    @Cookies('refreshToken') refreshToken: string,
    @Res({passthrough: true}) response: Response
  ): Promise<AccessToken> {
    // [step 1] Validate refresh token
    const userData = this.refreshTokenService.decodeToken(refreshToken) as {
      userId: string;
      sub: string;
      exp: number;
    };

    // [step 2] Invalidate existing tokens
    await this.accountService.invalidateTokens(userData.userId);

    // [step 3] Generate new tokens
    const {accessToken, refreshToken: newRefreshToken} =
      await this.accountService.generateTokens(userData.userId, userData.sub, {
        refreshTokenExpiryUnix: userData.exp,
      });

    // [step 4] Send refresh token to cookie.
    const {name, token, cookieConfig} = newRefreshToken;
    response.cookie(name, token, cookieConfig);

    // [step 5] Send access token as response.
    return accessToken;
  }

  /* End */
}
