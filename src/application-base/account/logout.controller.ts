import {Controller, Post, Body, Res} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Response} from 'express';
import {AccountService} from '@microservices/account/account.service';
import {RefreshTokenService} from '@microservices/token/refresh-token/refresh-token.service';

@ApiTags('Account')
@Controller('account')
export class LogoutController {
  constructor(
    private readonly accountService: AccountService,
    private readonly refreshTokenService: RefreshTokenService
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
    // [step 1] Invalidate all tokens
    await this.accountService.invalidateTokens(body.userId);

    // [step 2] Clear cookie
    response.clearCookie(
      this.refreshTokenService.cookieName,
      this.refreshTokenService.getCookieConfig()
    );

    // [step 3] Always return success no matter if the user exists.
    return {
      data: {message: 'User logs out successfully'},
    };
  }

  /* End */
}
