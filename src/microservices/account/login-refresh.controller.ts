import {Controller, Get, Res} from '@nestjs/common';
import {ApiTags, ApiCookieAuth} from '@nestjs/swagger';
import {Response} from 'express';
import {RefreshTokenService} from './security/token/refresh-token.service';
import {TokenService} from './security/token/token.service';
import {GuardByRefreshToken} from './security/passport/refresh-token/refresh-token.decorator';
import {Cookies} from '@toolkit/cookie/cookie.decorator';
import {AccessToken} from '@prisma/client';
import {secondsUntilUnixTimestamp} from '@toolkit/utilities/datetime.util';

@ApiTags('Account')
@Controller('account')
export class LoginRefreshController {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly tokenService: TokenService
  ) {}

  @GuardByRefreshToken()
  @Get('refresh-access-token')
  @ApiCookieAuth()
  async refresh(
    @Cookies('refreshToken') refreshToken: string,
    @Res({passthrough: true}) response: Response
  ): Promise<AccessToken> {
    // [step 1] Validate refresh token
    const tokenInfo = this.refreshTokenService.decodeToken(refreshToken) as {
      userId: string;
      sub: string;
      exp: number; // The timestamp of expiresIn. It is a future timestamp.
    };

    // [step 2] Invalidate existing tokens
    await this.tokenService.invalidateAccessTokenAndRefreshToken(
      tokenInfo.userId
    );

    // [step 3] Generate new tokens
    const {accessToken, refreshToken: newRefreshToken} =
      await this.tokenService.generateAccessTokenAndRefreshToken(
        {userId: tokenInfo.userId, sub: tokenInfo.sub},
        {expiresIn: secondsUntilUnixTimestamp(tokenInfo.exp)}
      );

    // [step 4] Send refresh token to cookie.
    const {token, cookie} = newRefreshToken;
    response.cookie(cookie.name, token, cookie.options);

    // [step 5] Send access token as response.
    return accessToken;
  }

  /* End */
}
