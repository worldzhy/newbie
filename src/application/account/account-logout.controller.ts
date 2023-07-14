import {Controller, Post, Body, Request} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {UserTokenStatus} from '@prisma/client';
import {UserTokenService} from './user/token/token.service';
import {TokenService} from '../../toolkit/token/token.service';

@ApiTags('[Application] Account')
@Controller('account')
export class AccountLogoutController {
  private tokenService = new TokenService();
  private userTokenService = new UserTokenService();

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
    @Request() request: Request,
    @Body() body: {userId: string}
  ): Promise<{data: {message: string}}> {
    const accessToken = this.tokenService.getTokenFromHttpRequest(request);

    await this.userTokenService.updateMany({
      where: {AND: [{userId: body.userId}, {token: accessToken}]},
      data: {status: UserTokenStatus.INACTIVE},
    });

    // Always return success no matter if the user exists.
    return {
      data: {message: 'User logs out successfully'},
    };
  }

  /* End */
}
