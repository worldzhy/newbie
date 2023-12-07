import {Body, Controller, Get, Patch, Req, Res} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiCookieAuth, ApiBody} from '@nestjs/swagger';
import {AccessToken, Prisma, User} from '@prisma/client';
import {Request, Response} from 'express';
import {AccountService} from '@microservices/account/account.service';
import {UserService} from '@microservices/account/user/user.service';
import {RefreshTokenService} from '@microservices/token/refresh-token/refresh-token.service';
import {Cookies} from '@_decorator/cookie.decorator';
import {AccessingRefreshEndpoint} from '@microservices/account/security/authentication/refresh/refresh.decorator';
import {UserProfileService} from '@microservices/account/user/user-profile.service';

@ApiTags('Account')
@Controller('account')
export class AccountOthersController {
  constructor(
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  @Get('me')
  @ApiBearerAuth()
  async getCurrentUser(@Req() request: Request) {
    return await this.accountService.me(request);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @ApiBody({
    description:
      'Set roleIds with an empty array to remove all the roles of the user.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          email: '',
          phone: '',
          profile: {
            update: {
              firstName: '',
              middleName: '',
              lastName: '',
            },
          },
        },
      },
    },
  })
  async editProfile(
    @Req() request: Request,
    @Body()
    body: Prisma.UserUpdateInput
  ): Promise<User> {
    const user = await this.accountService.me(request);

    if (!user['profile'] && body.profile) {
      await this.userProfileService.create({
        data: {
          userId: user.id,
          firstName: body.profile.update?.firstName as
            | string
            | null
            | undefined,
          middleName: body.profile.update?.middleName as
            | string
            | null
            | undefined,
          lastName: body.profile.update?.lastName as string | null | undefined,
        },
      });
      delete body.profile;
    }

    return await this.userService.update({
      where: {id: user.id},
      data: body,
      select: {
        id: true,
        email: true,
        phone: true,
        profile: true,
      },
    });
  }

  @AccessingRefreshEndpoint()
  @Get('refresh')
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
