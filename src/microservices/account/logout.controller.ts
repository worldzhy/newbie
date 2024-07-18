import {Controller, Post, Body, Res} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Response} from 'express';
import {RefreshTokenService} from '@microservices/account/security/token/refresh-token.service';
import {LimitLoginByUserService} from './security/rate-limiter/rate-limiter.service';
import {TokenService} from './security/token/token.service';

@ApiTags('Account')
@Controller('account')
export class LogoutController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly limitLoginByUserService: LimitLoginByUserService
  ) {}

  @Post('logout')
  @ApiBearerAuth()
  @ApiBody({
    description: "The request body must contain 'userId' attribute.",
    examples: {
      a: {
        summary: '1. Log out',
        value: {
          userId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
        },
      },
    },
  })
  async logout(
    @Body() body: {userId: string},
    @Res({passthrough: true}) response: Response
  ): Promise<{data: {message: string}}> {
    // [step 1] Invalidate all tokens.
    await this.tokenService.invalidateAccessTokenAndRefreshToken(body.userId);

    // [step 2] Clear user attempts.
    await this.limitLoginByUserService.delete(body.userId);

    // [step 3] Clear cookie
    response.clearCookie(
      this.refreshTokenService.cookieName,
      this.refreshTokenService.getCookieOptions()
    );

    // [step 3] Always return success no matter if the user exists.
    return {
      data: {message: 'User logs out successfully'},
    };
  }

  /* End */
}
